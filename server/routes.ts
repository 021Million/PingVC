import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVCSchema, insertPaymentSchema, insertEmailSubmissionSchema } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing required OpenAI secret: OPENAI_API_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/update-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      
      const user = await storage.updateUserProfile(userId, { firstName, lastName });
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.post('/api/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      
      const user = await storage.completeUserProfile(userId, { firstName, lastName });
      res.json(user);
    } catch (error) {
      console.error("Error completing user profile:", error);
      res.status(500).json({ message: "Failed to complete user profile" });
    }
  });

  // Profile routes
  app.get('/api/profile/founder', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const founder = await storage.getOrCreateFounder(userId);
      res.json(founder);
    } catch (error) {
      console.error("Error fetching founder profile:", error);
      res.status(500).json({ message: "Failed to fetch founder profile" });
    }
  });

  app.get('/api/profile/vcs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vcs = await storage.getVCsByUserId(userId);
      res.json(vcs);
    } catch (error) {
      console.error("Error fetching user VCs:", error);
      res.status(500).json({ message: "Failed to fetch user VCs" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, ...founderData } = req.body;
      
      // Update user profile
      if (firstName && lastName) {
        await storage.updateUserProfile(userId, { firstName, lastName });
      }
      
      // Update founder profile if user is a founder and founder data is provided
      if (Object.keys(founderData).length > 0) {
        const founder = await storage.getOrCreateFounder(userId);
        await storage.updateFounderProject(founder.id, founderData);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Project details route
  app.get('/api/projects/:id', async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const founder = await storage.getFounderById(projectId);
      if (!founder) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user has voted for this project
      let hasVoted = false;
      const userEmail = req.query.email as string || (req as any).user?.email;
      if (userEmail) {
        hasVoted = await storage.hasEmailVotedForProject(founder.id, userEmail);
      }
      
      res.json({
        ...founder,
        hasVoted
      });
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // VC routes
  app.get('/api/vcs', async (req, res) => {
    try {
      const { stage, sector, verified } = req.query;
      const filters: any = {};
      
      if (stage && stage !== 'All') filters.stage = stage as string;
      if (sector) filters.sector = sector as string;
      if (verified !== undefined) filters.verified = verified === 'true';
      
      const vcs = await storage.getVCs(filters);
      
      // Remove sensitive contact info for non-authenticated users
      const sanitizedVCs = vcs.map(vc => ({
        ...vc,
        contactHandle: vc.isVerified ? '[BLURRED]' : '[PENDING_VERIFICATION]'
      }));
      
      res.json(sanitizedVCs);
    } catch (error) {
      console.error("Error fetching VCs:", error);
      res.status(500).json({ message: "Failed to fetch VCs" });
    }
  });

  app.get('/api/vcs/:id', async (req, res) => {
    try {
      const vcId = parseInt(req.params.id);
      const vc = await storage.getVC(vcId);
      
      if (!vc) {
        return res.status(404).json({ message: "VC not found" });
      }
      
      // Check if user has unlocked this VC
      let contactHandle = '[BLURRED]';
      if (req.isAuthenticated && req.isAuthenticated()) {
        const userId = (req.user as any)?.claims?.sub;
        if (userId) {
          const founder = await storage.getOrCreateFounder(userId);
          const hasUnlocked = await storage.hasFounderUnlockedVC(founder.id, vcId);
          if (hasUnlocked) {
            contactHandle = vc.contactHandle;
          }
        }
      }
      
      res.json({
        ...vc,
        contactHandle: vc.isVerified ? contactHandle : '[PENDING_VERIFICATION]'
      });
    } catch (error) {
      console.error("Error fetching VC:", error);
      res.status(500).json({ message: "Failed to fetch VC" });
    }
  });

  app.post('/api/vcs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vcData = insertVCSchema.parse({
        ...req.body,
        userId
      });
      
      const vc = await storage.createVC(vcData);
      
      // Send thank you email
      try {
        await sendVCThankYouEmail(vc);
      } catch (emailError) {
        console.error("Error sending thank you email:", emailError);
        // Don't fail the VC creation if email fails
      }
      
      res.status(201).json(vc);
    } catch (error) {
      console.error("Error creating VC:", error);
      res.status(400).json({ message: "Failed to create VC profile" });
    }
  });

  // Admin routes
  app.get('/api/admin/vcs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const vcs = await storage.getVCs();
      res.json(vcs);
    } catch (error) {
      console.error("Error fetching VCs for admin:", error);
      res.status(500).json({ message: "Failed to fetch VCs" });
    }
  });

  app.patch('/api/admin/vcs/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const vcId = parseInt(req.params.id);
      const { isVerified } = req.body;
      
      const vc = await storage.updateVCVerification(vcId, isVerified);
      res.json(vc);
    } catch (error) {
      console.error("Error updating VC verification:", error);
      res.status(500).json({ message: "Failed to update VC verification" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { vcId } = req.body;
      const userId = req.user.claims.sub;
      
      const vc = await storage.getVC(vcId);
      if (!vc || !vc.isVerified) {
        return res.status(400).json({ message: "VC not found or not verified" });
      }
      
      const founder = await storage.getOrCreateFounder(userId);
      
      // Check if already unlocked
      const hasUnlocked = await storage.hasFounderUnlockedVC(founder.id, vcId);
      if (hasUnlocked) {
        return res.status(400).json({ message: "VC already unlocked" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: vc.price,
        currency: "usd",
        metadata: {
          vcId: vcId.toString(),
          founderId: founder.id.toString(),
        },
      });
      
      // Create pending payment record
      await storage.createPayment({
        id: paymentIntent.id,
        founderId: founder.id,
        vcId,
        amount: vc.price,
        paymentType: "vc_unlock",
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  // Project visibility payment endpoint
  app.post("/api/create-project-visibility-payment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const founder = await storage.getOrCreateFounder(userId);
      
      // Create payment intent for $9 project visibility
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 900, // $9 in cents
        currency: 'usd',
        metadata: {
          founderId: founder.id.toString(),
          paymentType: 'project_visibility'
        },
      });
      
      // Create pending payment record
      await storage.createPayment({
        id: paymentIntent.id,
        founderId: founder.id,
        amount: 900,
        paymentType: "project_visibility",
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating project visibility payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  app.post("/api/confirm-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const founderId = parseInt(paymentIntent.metadata.founderId);
        const paymentType = paymentIntent.metadata.paymentType;
        
        if (paymentType === 'project_visibility') {
          // Update founder visibility status
          await storage.updateFounderProject(founderId, { isVisible: true });
          
          // Update payment status
          await storage.updatePaymentStatus(paymentIntentId, "completed");
          
          res.json({
            success: true,
            type: 'project_visibility',
            message: 'Project is now visible in the Scout marketplace!'
          });
        } else if (paymentType === 'vc_unlock') {
          const vcId = parseInt(paymentIntent.metadata.vcId);
          
          const vc = await storage.getVC(vcId);
          if (!vc) {
            return res.status(400).json({ message: "VC not found" });
          }
          
          // Generate AI intro template
          const introTemplate = await generateIntroTemplate(vc);
          
          // Update payment status
          const payment = await storage.updatePaymentStatus(
            paymentIntentId, 
            "completed", 
            introTemplate
          );
        
          res.json({
            success: true,
            type: 'vc_unlock',
            vc: {
              ...vc,
              contactHandle: vc.contactHandle // Reveal actual contact
            },
            introTemplate,
            payment
          });
        }
      } else {
        res.status(400).json({ message: "Payment not completed" });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error confirming payment" });
    }
  });

  // User's payments and unlocked VCs
  app.get('/api/my-unlocks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const founder = await storage.getOrCreateFounder(userId);
      const payments = await storage.getPaymentsByFounder(founder.id);
      
      const unlockedVCs = [];
      for (const payment of payments.filter(p => p.status === 'completed')) {
        const vc = await storage.getVC(payment.vcId!);
        if (vc) {
          unlockedVCs.push({
            ...vc,
            payment,
            introTemplate: payment.introTemplate
          });
        }
      }
      
      res.json(unlockedVCs);
    } catch (error) {
      console.error("Error fetching user unlocks:", error);
      res.status(500).json({ message: "Failed to fetch unlocked VCs" });
    }
  });

  // Profile completion route
  app.post('/api/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const { firstName, lastName } = req.body;
      const userId = req.user.claims.sub;
      
      const user = await storage.completeUserProfile(userId, { firstName, lastName });
      res.json(user);
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });

  // Founder project routes
  app.post('/api/founder/project', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const founder = await storage.getOrCreateFounder(userId);
      
      const updatedFounder = await storage.updateFounderProject(founder.id, req.body);
      res.json(updatedFounder);
    } catch (error) {
      console.error("Error updating founder project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Scout page routes
  app.get('/api/scout/featured', async (req, res) => {
    try {
      const featuredFounders = await storage.getFeaturedFounders();
      res.json(featuredFounders);
    } catch (error) {
      console.error("Error fetching featured founders:", error);
      res.status(500).json({ message: "Failed to fetch featured projects" });
    }
  });

  app.get('/api/scout/projects', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const email = req.user?.email || req.headers['x-user-email'];
      const founders = await storage.getFoundersByRanking();
      
      // Add voting status for users with email
      const foundersWithVotes = await Promise.all(
        founders.map(async (founder) => ({
          ...founder,
          hasVoted: email ? await storage.hasEmailVotedForProject(founder.id, email) : false,
        }))
      );
      
      res.json(foundersWithVotes);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/scout/projects/:founderId/vote', async (req: any, res) => {
    try {
      const founderId = parseInt(req.params.founderId);
      const { email } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required for voting" });
      }

      // Check if email can vote today (24-hour limit)
      const canVote = await storage.canEmailVoteToday(email);
      if (!canVote) {
        return res.status(429).json({ message: "You can only vote once every 24 hours" });
      }

      // Check if already voted for this project
      const hasVoted = await storage.hasEmailVotedForProject(founderId, email);
      if (hasVoted) {
        return res.status(400).json({ message: "You have already voted for this project" });
      }
      
      await storage.voteForProject(founderId, email, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting for project:", error);
      res.status(500).json({ message: "Failed to vote for project" });
    }
  });

  app.post('/api/scout/projects/:founderId/unvote', async (req: any, res) => {
    try {
      const founderId = parseInt(req.params.founderId);
      const { email } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required for voting" });
      }
      
      await storage.unvoteForProject(founderId, email, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing vote:", error);
      res.status(500).json({ message: "Failed to remove vote" });
    }
  });

  // Founder profile management
  app.get('/api/founder/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const founder = await storage.getOrCreateFounder(userId);
      res.json(founder);
    } catch (error) {
      console.error("Error fetching founder:", error);
      res.status(500).json({ message: "Failed to fetch founder profile" });
    }
  });

  app.post('/api/founder/project', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const founder = await storage.getOrCreateFounder(userId);
      
      const projectData = {
        companyName: req.body.companyName,
        logoUrl: req.body.logoUrl, // Add logo URL support
        pitchDeckUrl: req.body.pitchDeckUrl,
        amountRaising: req.body.amountRaising,
        traction: req.body.traction,
        ecosystem: req.body.ecosystem,
        vertical: req.body.vertical,
        description: req.body.description,
      };

      const updatedFounder = await storage.updateFounderProject(founder.id, projectData);
      res.json(updatedFounder);
    } catch (error) {
      console.error("Error updating founder project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Support form submission
  app.post('/api/support', async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;
      
      // In a real application, you'd save this to database and/or send email
      console.log('Support request received:', {
        name,
        email,
        subject,
        category,
        message,
        timestamp: new Date().toISOString()
      });
      
      res.json({ success: true, message: "Support request submitted successfully" });
    } catch (error) {
      console.error("Error submitting support request:", error);
      res.status(500).json({ message: "Failed to submit support request" });
    }
  });

  // Email submission route
  app.post('/api/submit-email', async (req, res) => {
    try {
      const { email, source } = req.body;
      
      if (!email || !source) {
        return res.status(400).json({ message: "Email and source are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const submission = await storage.submitEmail({ email, source });
      res.json({ success: true, submission });
    } catch (error) {
      console.error("Error submitting email:", error);
      res.status(500).json({ message: "Failed to submit email" });
    }
  });

  app.get('/api/check-email-access', async (req, res) => {
    try {
      const { email, source } = req.query;
      
      if (!email || !source) {
        return res.status(400).json({ message: "Email and source are required" });
      }

      const hasAccess = await storage.hasEmailAccess(email as string, source as string);
      res.json({ hasAccess });
    } catch (error) {
      console.error("Error checking email access:", error);
      res.status(500).json({ message: "Failed to check email access" });
    }
  });

  // Create payment intent for project visibility
  app.post('/api/create-project-payment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const founder = await storage.getOrCreateFounder(userId);
      
      // Project visibility costs $49
      const amount = 4900; // $49 in cents
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          type: 'project_visibility',
          founderId: founder.id.toString(),
          userId: userId
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: amount / 100 
      });
    } catch (error: any) {
      console.error("Error creating project payment:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create payment intent for VC contact unlock
  app.post('/api/create-vc-payment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { vcId } = req.body;
      
      if (!vcId) {
        return res.status(400).json({ message: "VC ID is required" });
      }

      const vc = await storage.getVC(vcId);
      if (!vc) {
        return res.status(404).json({ message: "VC not found" });
      }

      const founder = await storage.getOrCreateFounder(userId);
      
      // Check if founder has already unlocked this VC
      const hasUnlocked = await storage.hasFounderUnlockedVC(founder.id, vcId);
      if (hasUnlocked) {
        return res.status(400).json({ message: "You have already unlocked this VC" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: vc.price,
        currency: 'usd',
        metadata: {
          type: 'vc_unlock',
          founderId: founder.id.toString(),
          vcId: vcId.toString(),
          userId: userId
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: vc.price / 100,
        vcName: vc.fundName 
      });
    } catch (error: any) {
      console.error("Error creating VC payment:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Confirm payment and handle success
  app.post('/api/confirm-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not successful" });
      }

      const metadata = paymentIntent.metadata;
      const userId = req.user.claims.sub;

      // Create payment record
      const payment = await storage.createPayment({
        id: paymentIntent.id,
        founderId: parseInt(metadata.founderId),
        vcId: metadata.vcId ? parseInt(metadata.vcId) : null,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentType: metadata.type,
        stripePaymentIntentId: paymentIntent.id
      });

      let introTemplate = null;

      // Handle different payment types
      if (metadata.type === 'vc_unlock' && metadata.vcId) {
        // Generate AI intro template for VC unlock
        const vc = await storage.getVC(parseInt(metadata.vcId));
        const founder = await storage.getOrCreateFounder(userId);
        
        if (vc && founder) {
          introTemplate = await generateIntroTemplate(vc);
          await storage.updatePaymentStatus(payment.id, 'completed', introTemplate);
        }
      } else if (metadata.type === 'project_visibility') {
        // Update founder project visibility
        await storage.updatePaymentStatus(payment.id, 'completed');
      }

      res.json({ 
        success: true, 
        payment,
        introTemplate 
      });
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function sendVCThankYouEmail(vc: any): Promise<void> {
  // Note: This is a placeholder for email functionality
  // In a real implementation, you would integrate with an email service like:
  // - SendGrid, Mailgun, AWS SES, etc.
  console.log(`Thank you email would be sent to: ${vc.email}`);
  console.log(`VC Name: ${vc.partnerName}, Fund: ${vc.fundName}`);
  console.log(`Email content: Thank you for applying to join Ping Me as a VC. A team member will be in touch with you soon to complete verification.`);
  
  // Example implementation (uncomment when you have an email service):
  /*
  const emailContent = {
    to: vc.email,
    from: 'team@pingme.com',
    subject: 'Thank you for your VC application - Ping Me',
    html: `
      <h2>Thank you for applying, ${vc.partnerName}!</h2>
      <p>We've received your application to join Ping Me as a VC partner from ${vc.fundName}.</p>
      <p>Our team will review your application and be in touch with you soon to complete the verification process.</p>
      <p>In the meantime, feel free to reach out if you have any questions.</p>
      <p>Best regards,<br>The Ping Me Team</p>
    `
  };
  
  await emailService.send(emailContent);
  */
}

async function generateIntroTemplate(vc: any): Promise<string> {
  try {
    const prompt = `Generate a professional, personalized intro message template for a founder reaching out to ${vc.fundName} (${vc.partnerName}). 

VC Details:
- Stage: ${vc.stage}
- Sectors: ${vc.sectors.join(', ')}
- Investment Thesis: ${vc.investmentThesis}
- Contact Type: ${vc.contactType}

Create a concise, compelling intro message that:
1. Shows the founder researched the VC
2. Clearly states the ask
3. Highlights key metrics placeholders
4. Matches the VC's investment focus
5. Is appropriate for ${vc.contactType === 'telegram' ? 'Telegram messaging' : 'scheduling a meeting'}

Keep it under 150 words and include placeholders like [Your Company], [Amount], [Key Metric], etc.

Respond with just the message template, no additional text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Hi! I'm reaching out because I'm building [Your Company] in the [sector] space. We're raising [amount] and would love to share our vision with your team. [Brief value prop]. Would you be open to a conversation?";
  } catch (error) {
    console.error("Error generating intro template:", error);
    return "Hi! I'm reaching out because I'm building [Your Company] in the [sector] space. We're raising [amount] and would love to share our vision with your team. [Brief value prop]. Would you be open to a conversation?";
  }
}
