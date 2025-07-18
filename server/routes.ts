import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Airtable from "airtable";
import { BeehiivClient } from "@beehiiv/sdk";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupEmailAuth } from "./emailAuth";
import { insertVCSchema, insertPaymentSchema, insertEmailSubmissionSchema } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import bcrypt from "bcrypt";

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

// Initialize Beehiiv API
let beehiiv: BeehiivClient | null = null;
if (process.env.BEEHIIV_API_KEY) {
  beehiiv = new BeehiivClient({ apiKey: process.env.BEEHIIV_API_KEY });
}

// Helper function to add email to Beehiiv newsletter
async function addToBeehiivNewsletter(email: string, name?: string): Promise<boolean> {
  try {
    if (!beehiiv || !process.env.BEEHIIV_PUBLICATION_ID) {
      console.log("Beehiiv not configured, skipping newsletter subscription");
      return false;
    }

    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
    
    const subscription = await beehiiv.subscriptions.create(publicationId, {
      email: email,
      reactivate_existing: true,
      send_welcome_email: true
    });

    console.log(`✅ Successfully subscribed ${email} to Beehiiv newsletter`);
    return true;
  } catch (error) {
    console.error("Error subscribing to Beehiiv:", error);
    return false;
  }
}

// Helper function to save VC signup to Airtable
async function saveVCToAirtable(vcData: any): Promise<boolean> {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.log("Airtable not configured, skipping VC save");
      return false;
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    
    // Save to VC Signups table
    await base('VC Signups').create({
      'Name': vcData.partnerName,
      'Email': vcData.email,
      'Fund': vcData.fundName,
      'Title': vcData.title,
      'Investment Stage': vcData.stage,
      'Sectors': vcData.sectors?.join(', ') || '',
      'Investment Thesis': vcData.investmentThesis,
      'Contact Type': vcData.contactType,
      'Contact Info': vcData.contactInfo,
      'Price': vcData.price,
      'Limit': vcData.limit,
      'Website': vcData.website,
      'LinkedIn': vcData.linkedin,
      'Twitter': vcData.twitter,
      'Bio': vcData.bio,
      'Signup Date': new Date().toISOString(),
      'Status': 'Pending Review'
    });

    console.log(`✅ Successfully saved VC ${vcData.partnerName} to Airtable`);
    return true;
  } catch (error) {
    console.error("Error saving VC to Airtable:", error);
    return false;
  }
}

// Helper function to save founder project to Airtable
async function saveFounderProjectToAirtable(founderData: any, user: any): Promise<boolean> {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.log("Airtable not configured, skipping founder project save");
      return false;
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    
    // Save to Founder Projects table (for published projects)
    if (founderData.isPublished || founderData.isVisible) {
      await base('Founder Projects').create({
        'Founder Name': user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Unknown',
        'Founder Email': user?.email,
        'Project Name': founderData.companyName,
        'Description': founderData.description,
        'One Line Description': founderData.oneLineDescription,
        'Website': founderData.websiteUrl,
        'Twitter': founderData.twitterUrl,
        'LinkedIn': founderData.linkedinUrl,
        'Founder Twitter': founderData.founderTwitterUrl,
        'Ecosystem': founderData.ecosystem,
        'Vertical': founderData.vertical,
        'Project Stage': founderData.projectStage,
        'Amount Raising': founderData.amountRaising,
        'Valuation': founderData.valuation,
        'Traction': founderData.traction,
        'Revenue Generating': founderData.revenueGenerating ? 'Yes' : 'No',
        'Ticker Launched': founderData.tickerLaunched ? 'Yes' : 'No',
        'DexScreener URL': founderData.dexScreenerUrl,
        'Pitch Deck URL': founderData.pitchDeckUrl,
        'Data Room URL': founderData.dataRoomUrl,
        'Logo URL': founderData.logoUrl,
        'Upvotes': founderData.upvotes || 0,
        'Is Published': founderData.isPublished ? 'Yes' : 'No',
        'Is Visible': founderData.isVisible ? 'Yes' : 'No',
        'Is Featured': founderData.isFeatured ? 'Yes' : 'No',
        'Submission Date': new Date().toISOString(),
        'Status': founderData.isPublished ? 'Published' : 'Draft'
      });
    }

    // Also save to Project Submissions table (for ALL submissions including drafts)
    await base('Project Submissions').create({
      'Founder Name': user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Unknown',
      'Founder Email': user?.email,
      'User ID': user?.id,
      'Company Name': founderData.companyName,
      'Description': founderData.description,
      'Logo URL': founderData.logoUrl,
      'Website URL': founderData.websiteUrl,
      'Project Stage': founderData.projectStage,
      'Twitter URL': founderData.twitterUrl,
      'LinkedIn URL': founderData.linkedinUrl,
      'Founder Twitter URL': founderData.founderTwitterUrl,
      'Pitch Deck URL': founderData.pitchDeckUrl,
      'Data Room URL': founderData.dataRoomUrl,
      'Ecosystem': founderData.ecosystem,
      'Vertical': founderData.vertical,
      'Ticker Launched': founderData.tickerLaunched ? 'Yes' : 'No',
      'DexScreener URL': founderData.dexScreenerUrl,
      'Revenue Generating': founderData.revenueGenerating ? 'Yes' : 'No',
      'Amount Raising': founderData.amountRaising,
      'Valuation': founderData.valuation,
      'Traction': founderData.traction,
      'Submission Date': new Date().toISOString(),
      'Submission Type': founderData.isPublished ? 'Published' : 'Draft',
      'Is Published': founderData.isPublished ? 'Yes' : 'No',
      'Is Visible': founderData.isVisible ? 'Yes' : 'No',
      'Source': 'Project Setup Page',
      'Verification Status': founderData.verificationStatus || 'under_review'
    });

    console.log(`✅ Successfully saved founder project ${founderData.companyName} to Airtable`);
    return true;
  } catch (error) {
    console.error("Error saving founder project to Airtable:", error);
    return false;
  }
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage_multer,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// In-memory storage for requests (extend to database later)
let requests: Array<{
  id: string;
  name: string;
  email: string;
  message: string;
  category?: string;
  timestamp: string;
}> = [];

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  setupEmailAuth(app);

  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));

  // Unified VC Discovery & Booking API - redirects to working Airtable endpoint
  app.get('/api/browse-vcs', async (req, res) => {
    try {
      // Just redirect to the working Airtable endpoint that already has the correct structure
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        return res.status(500).json({ error: 'Airtable configuration missing' });
      }

      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      const records = await base('VCs').select().all();

      const verifiedVCs: any[] = [];
      const unverifiedVCs: any[] = [];

      records.forEach(record => {
        const fields = record.fields;
        
        // Normalize array fields to ensure consistent structure and spacing
        const normalizeToArray = (field: any): string[] => {
          if (!field) return [];
          if (Array.isArray(field)) return field;
          if (typeof field === 'string') {
            // Handle comma-separated values with proper spacing
            return field.split(',').map(item => item.trim()).filter(item => item.length > 0);
          }
          return [field.toString()];
        };

        const vc = {
          id: record.id,
          name: fields.Name,
          fund: fields.Fund,
          title: fields.Title,
          verified: fields.Verified || false,
          twitter: fields.Twitter,
          linkedin: fields.LinkedIn,
          email: fields.Email,
          telegram: fields.Telegram,
          'Meeting/Calendly Link': fields['Meeting/Calendly Link'],
          'Investment Stage': normalizeToArray(fields['Investment Stage']),
          'Primary Sector': normalizeToArray(fields['Primary Sector']),
          'Investment Thesis': fields['Investment Thesis'],
          Image: fields.Image,
          imageUrl: fields['Image URL'],
          specialties: normalizeToArray(fields.Specialties || fields['Primary Sector']),
          stages: normalizeToArray(fields['Investment Stage']),
          price: fields.Price,
          limit: fields.Limit,
          contactLink: fields['Contact Link'],
          bio: fields.Bio,
          website: fields.Website
        };

        if (vc.verified) {
          verifiedVCs.push(vc);
        } else {
          unverifiedVCs.push(vc);
        }
      });

      res.json({ verifiedVCs, unverifiedVCs });
    } catch (error) {
      console.error('Error fetching VCs:', error);
      res.status(500).json({ error: 'Failed to fetch VCs' });
    }
  });

  // Email Capture for Miss AI Early Access
  app.post('/api/email-capture', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Store email in session to prevent re-showing modal
      (req as any).session.emailCaptured = true;

      // Log the early bird signup (in production, you'd store this in database or send to email service)
      console.log(`📥 New Miss AI Early Bird: ${email} at ${new Date().toISOString()}`);

      // TODO: In production, you would:
      // 1. Store in database for email marketing
      // 2. Send to Airtable or email service provider
      // 3. Send welcome email
      // 4. Add to email marketing list (Mailchimp, ConvertKit, etc.)

      res.json({ 
        success: true,
        message: "Successfully joined Miss AI early access!" 
      });
    } catch (error) {
      console.error('Error capturing email:', error);
      res.status(500).json({ error: 'Failed to capture email' });
    }
  });

  // Newsletter signup endpoint
  app.post('/api/newsletter-signup', async (req, res) => {
    try {
      const { email, name, source } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Add to Beehiiv newsletter
      const beehiivSuccess = await addToBeehiivNewsletter(email, name);

      // Store in local database for tracking
      try {
        await storage.submitEmail({
          email,
          source: source || 'newsletter',
          submittedAt: new Date(),
        });
      } catch (dbError) {
        console.error('Error saving email to database:', dbError);
        // Continue even if DB save fails
      }

      res.json({ 
        success: true, 
        beehiivSubscribed: beehiivSuccess,
        message: beehiivSuccess 
          ? "Successfully subscribed to Ping VC newsletter!" 
          : "Email captured, but newsletter subscription failed. Our team will add you manually."
      });
    } catch (error) {
      console.error('Error processing newsletter signup:', error);
      res.status(500).json({ error: 'Failed to process newsletter signup' });
    }
  });

  // Request Call for Unverified VCs - Now saves to Airtable
  app.post('/api/request-call', async (req, res) => {
    try {
      const { vcId, founderEmail, founderName = '', message = '' } = req.body;

      if (!vcId || !founderEmail) {
        return res.status(400).json({ error: 'Missing vcId or founderEmail' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(founderEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Get VC details from Airtable
      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      const record = await base('VCs').find(vcId);
      
      if (!record) {
        return res.status(404).json({ error: 'VC not found' });
      }

      const vcName = record.get('Name') as string;
      const vcFund = record.get('Fund') as string;
      const vcEmail = record.get('Email') as string;

      try {
        // Store the request in Airtable "Booking Requests" table
        await base('Booking Requests').create({
          'VC Name': vcName,
          'VC Fund': vcFund,
          'VC Email': vcEmail,
          'VC ID': vcId,
          'Founder Email': founderEmail,
          'Founder Name': founderName,
          'Message': message,
          'Request Date': new Date().toISOString(),
          'Status': 'Pending'
        });

        console.log(`📩 New booking request saved to Airtable:
          VC: ${vcName} (${vcFund})
          From: ${founderEmail} (${founderName})
          VC ID: ${vcId}
          Timestamp: ${new Date().toISOString()}
        `);

      } catch (airtableError) {
        console.error('Error saving to Airtable:', airtableError);
        // Continue with the response even if Airtable save fails
      }

      // Add founder email to Beehiiv newsletter
      try {
        await addToBeehiivNewsletter(founderEmail, founderName);
      } catch (beehiivError) {
        console.error('Error adding to Beehiiv:', beehiivError);
        // Continue with the response even if Beehiiv fails
      }

      res.json({ 
        message: 'Request sent successfully! Our team will reach out to facilitate the introduction.',
        vcName,
        vcFund
      });
    } catch (error) {
      console.error('Error processing call request:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });

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

  app.get('/api/profile/investor-activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activity = await storage.getInvestorActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching investor activity:", error);
      res.status(500).json({ message: "Failed to fetch investor activity" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, email, newPassword, ...founderData } = req.body;
      
      // Handle password update if provided
      let hashedPassword = undefined;
      if (newPassword && newPassword.length >= 8) {
        hashedPassword = await bcrypt.hash(newPassword, 12);
      }
      
      // Update user profile and optionally password
      if (hashedPassword) {
        await storage.updateUserAndPassword(userId, { firstName, lastName, email }, hashedPassword);
      } else if (firstName && lastName) {
        await storage.updateUserProfile(userId, { firstName, lastName, email });
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

  // Admin routes for investor approval
  app.put("/api/admin/approve-investor/:userId", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const { isApproved } = req.body;

      const updatedUser = await storage.updateUserApprovalStatus(userId, isApproved);
      
      res.json({ 
        message: `Investor ${isApproved ? 'approved' : 'rejected'} successfully`,
        user: updatedUser 
      });
    } catch (error: any) {
      console.error("Investor approval error:", error);
      res.status(500).json({ message: error.message });
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

  // Airtable test endpoint
  app.get('/api/airtable/test', async (req, res) => {
    try {
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        return res.status(500).json({ 
          message: "Airtable credentials not configured",
          hasApiKey: !!process.env.AIRTABLE_API_KEY,
          hasBaseId: !!process.env.AIRTABLE_BASE_ID,
          baseIdFormat: process.env.AIRTABLE_BASE_ID?.substring(0, 3) + "..." 
        });
      }

      console.log("Testing Airtable connection...");
      console.log("API Key format:", process.env.AIRTABLE_API_KEY?.substring(0, 10) + "...");
      console.log("Base ID format:", process.env.AIRTABLE_BASE_ID);

      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      
      // First, try to get base metadata
      try {
        const tables = await base.table('VCs').select({ maxRecords: 1 }).firstPage();
        console.log("Successfully connected to Airtable!");
        res.json({ 
          success: true, 
          message: "Airtable connection successful",
          recordCount: tables.length 
        });
      } catch (error: any) {
        console.log("Airtable error details:", error);
        res.status(400).json({ 
          success: false,
          error: error.message,
          statusCode: error.statusCode,
          details: "Check that your API key has proper permissions and base ID is correct"
        });
      }
    } catch (error: any) {
      console.error("Airtable test error:", error);
      res.status(500).json({ message: "Failed to test Airtable connection", error: error.message });
    }
  });

  // Airtable VCs route
  app.get('/api/airtable/vcs', async (req, res) => {
    try {
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        return res.status(500).json({ message: "Airtable credentials not configured" });
      }

      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      const records = await base('VCs').select().all();

      const verifiedVCs: any[] = [];
      const unverifiedVCs: any[] = [];

      records.forEach(record => {
        const fields = record.fields;
        // Normalize array fields to ensure consistent structure and spacing
        const normalizeToArray = (field: any): string[] => {
          if (!field) return [];
          if (Array.isArray(field)) return field;
          if (typeof field === 'string') {
            // Handle comma-separated values with proper spacing
            return field.split(',').map(item => item.trim()).filter(item => item.length > 0);
          }
          return [field.toString()];
        };

        const vc = {
          id: record.id,
          name: fields.Name,
          fund: fields.Fund,
          title: fields.Title,
          verified: fields.Verified || false,
          twitter: fields.Twitter,
          linkedin: fields.LinkedIn,
          email: fields.Email,
          telegram: fields.Telegram,
          'Meeting/Calendly Link': fields['Meeting/Calendly Link'],
          'X Profile': fields['X Profile'],
          'Investment Stage': normalizeToArray(fields['Investment Stage']),
          'Primary Sector': normalizeToArray(fields['Primary Sector']),
          'Investment Thesis': fields['Investment Thesis'],
          'Portfolio Performance': fields['Portfolio Performance'],
          Position: fields.Position,
          Location: fields.Location,
          Website: fields.Website,
          'LinkedIn Profile': fields['LinkedIn Profile'],
          'Investment Tag': fields['Investment Tag'],
          'Check Size': fields['Check Size'],
          'Donate To Charity': fields['Donate To Charity'],
          Image: fields.Image,
          imageUrl: fields['Image URL'],
          specialties: normalizeToArray(fields.Specialties || fields['Primary Sector']),
          stages: normalizeToArray(fields['Investment Stage']),
          price: fields.Price,
          limit: fields.Limit,
          contactLink: fields['Contact Link'],
          bio: fields.Bio
        };

        if (vc.verified) {
          verifiedVCs.push(vc);
        } else {
          unverifiedVCs.push(vc);
        }
      });

      res.json({ verifiedVCs, unverifiedVCs });
    } catch (error) {
      console.error("Error fetching Airtable VCs:", error);
      res.status(500).json({ message: "Failed to fetch VCs from Airtable" });
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
      
      // Save VC signup to Airtable
      try {
        await saveVCToAirtable(vc);
      } catch (airtableError) {
        console.error("Error saving VC to Airtable:", airtableError);
        // Don't fail the VC creation if Airtable save fails
      }
      
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

  // Check if email has unlocked a specific VC
  app.get("/api/check-vc-unlock", async (req, res) => {
    try {
      const { email, vcId, vcType } = req.query;
      
      if (!email || !vcId || !vcType) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const hasUnlocked = await storage.hasEmailUnlockedVC(email as string, vcId as string, vcType as string);
      res.json({ hasUnlocked });
    } catch (error) {
      console.error("Error checking VC unlock status:", error);
      res.status(500).json({ message: "Error checking unlock status", hasUnlocked: false });
    }
  });

  // VC Unlock Payment Endpoint for Airtable VCs
  app.post("/api/create-vc-unlock-payment", async (req, res) => {
    try {
      const { vcId, vcType, email, amount } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if already unlocked
      const hasUnlocked = await storage.hasEmailUnlockedVC(email, vcId, vcType);
      if (hasUnlocked) {
        return res.status(400).json({ message: "VC already unlocked for this email" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        metadata: {
          vcId: vcId.toString(),
          vcType,
          email,
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating VC unlock payment:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  // Payment success confirmation endpoint
  app.post("/api/confirm-vc-unlock-payment", async (req, res) => {
    try {
      const { paymentIntentId, vcId, vcType, email } = req.body;
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not completed" });
      }
      
      // Create unlock record
      await storage.createVCUnlock({
        email,
        vcId,
        vcType,
        amount: paymentIntent.amount,
        paymentType: "verified_vc",
        stripePaymentIntentId: paymentIntentId,
        status: "completed",
      });
      
      res.json({ success: true, message: "VC contact information unlocked successfully" });
    } catch (error) {
      console.error("Error confirming VC unlock payment:", error);
      res.status(500).json({ message: "Error confirming payment" });
    }
  });

  // Legacy payment route for platform VCs
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

  // Project publishing route - creates Stripe checkout for $9
  app.post("/api/publish-project", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const founder = await storage.getOrCreateFounder(userId);
      
      if (!founder.companyName || !founder.description) {
        return res.status(400).json({ 
          message: "Please complete your company name and description before publishing" 
        });
      }

      // Create Stripe checkout session for $9
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Project Visibility',
                description: 'Publish your project to the Scout marketplace',
              },
              unit_amount: 900, // $9.00 in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/profile`,
        metadata: {
          founderId: founder.id.toString(),
          paymentType: 'project_visibility',
        },
      });

      res.json({ paymentUrl: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Webhook to handle Stripe checkout completion
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      const event = req.body;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const founderId = parseInt(session.metadata.founderId);
        const paymentType = session.metadata.paymentType;

        if (paymentType === 'project_visibility') {
          // Update founder visibility and published status
          const updatedFounder = await storage.updateFounderProject(founderId, { 
            isVisible: true, 
            isPublished: true 
          });
          
          // Get user data for Airtable
          const founder = await storage.getFounderById(founderId);
          const user = founder ? await storage.getUser(founder.userId) : null;
          
          // Save to Airtable now that project is published
          if (updatedFounder && user) {
            try {
              await saveFounderProjectToAirtable(updatedFounder, user);
            } catch (airtableError) {
              console.error("Error saving published project to Airtable:", airtableError);
            }
          }
          
          // Create payment record
          await storage.createPayment({
            id: session.payment_intent,
            founderId: founderId,
            amount: 900,
            paymentType: "project_visibility",
            stripePaymentIntentId: session.payment_intent,
            status: "completed",
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error}`);
    }
  });

  // Password management routes
  app.post("/api/set-password", isAuthenticated, async (req: any, res) => {
    try {
      const { password } = req.body;
      const userId = req.user.claims.sub;
      
      if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      await storage.setUserPassword(userId, hashedPassword);
      
      res.json({ success: true, message: "Password set successfully" });
    } catch (error) {
      console.error("Error setting password:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });

  app.post("/api/update-password", isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.claims.sub;
      
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({ message: "User has no password set" });
      }
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.post("/api/reset-password", isAuthenticated, async (req: any, res) => {
    try {
      const { newPassword } = req.body;
      const userId = req.user.claims.sub;
      
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
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
      const user = await storage.getUser(userId);
      
      const updatedFounder = await storage.updateFounderProject(founder.id, req.body);
      
      // Save to Airtable for all project submissions (including drafts)
      try {
        await saveFounderProjectToAirtable(updatedFounder, user);
      } catch (airtableError) {
        console.error("Error saving founder project to Airtable:", airtableError);
        // Don't fail the project save if Airtable save fails
      }
      
      res.json(updatedFounder);
    } catch (error) {
      console.error("Error updating founder project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Admin routes for project verification
  app.get('/api/admin/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const projects = await storage.getAllProjectsForAdmin();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching admin projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/admin/projects/:founderId/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const founderId = parseInt(req.params.founderId);
      const { status, notes } = req.body;

      if (!['under_review', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid verification status" });
      }

      const updatedProject = await storage.updateProjectVerificationStatus(founderId, status, notes);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ message: "Failed to update verification status" });
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
        logoUrl: req.body.logoUrl,
        description: req.body.description,
        projectStage: req.body.projectStage,
        tickerLaunched: req.body.tickerLaunched,
        dexScreenerUrl: req.body.dexScreenerUrl,
        pitchDeckUrl: req.body.pitchDeckUrl,
        amountRaising: req.body.amountRaising,
        valuation: req.body.valuation,
        traction: req.body.traction,
        ecosystem: req.body.ecosystem,
        vertical: req.body.vertical,
        dataRoomUrl: req.body.dataRoomUrl,
        linkedinUrl: req.body.linkedinUrl,
        twitterUrl: req.body.twitterUrl,
        founderTwitterUrl: req.body.founderTwitterUrl,
        websiteUrl: req.body.websiteUrl,
        revenueGenerating: req.body.revenueGenerating,
      };

      const updatedFounder = await storage.updateFounderProject(founder.id, projectData);
      res.json(updatedFounder);
    } catch (error) {
      console.error("Error updating founder project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // File upload endpoints
  app.post('/api/upload/logo', isAuthenticated, upload.single('logo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        fileUrl,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // General image upload endpoint
  app.post('/api/upload-image', upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        url: fileUrl,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  // Scout projects from Airtable Project Submissions API
  app.get('/api/scout-projects', async (req, res) => {
    try {
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        return res.status(500).json({ error: 'Airtable configuration missing' });
      }

      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      
      // Fetch from Project Submissions table - get all records to check field structure
      const records = await base('Project Submissions').select().all();

      // Map records to the expected format for the frontend
      const projects = records
        .filter(record => record.get('Company Name')) // Only projects with company names
        .map(record => ({
          id: record.id,
          companyName: record.get('Company Name') as string,
          description: record.get('Description') as string,
          projectStage: record.get('Project Stage') as string,
          tickerLaunched: record.get('Ticker Launched') === 'Yes',
          dexScreenerUrl: record.get('DexScreener URL') as string,
          amountRaising: record.get('Amount Raising') as string,
          valuation: record.get('Valuation') as string,
          ecosystem: record.get('Ecosystem') as string,
          vertical: record.get('Vertical') as string,
          twitterUrl: record.get('Twitter URL') as string,
          founderTwitterUrl: record.get('Founder Twitter URL') as string,
          linkedinUrl: record.get('LinkedIn URL') as string,
          websiteUrl: record.get('Website URL') as string,
          revenueGenerating: record.get('Revenue Generating') === 'Yes',
          logoUrl: record.get('Logo URL') as string,
          pitchDeckUrl: record.get('Pitch Deck URL') as string,
          dataRoomUrl: record.get('Data Room URL') as string,
          traction: record.get('Traction') as string,
          votes: record.get('Votes') as number || 0,
          createdAt: record.get('Submission Date') as string,
          verificationStatus: 'verified', // Default to verified for published projects
        }));

      res.json(projects);
    } catch (error) {
      console.error('Error fetching Scout projects from Project Submissions:', error);
      res.status(500).json({ error: 'Failed to fetch Scout projects' });
    }
  });

  // Create Stripe payment for Scout marketplace publishing
  app.post('/api/create-scout-payment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create Stripe checkout session for $9 Scout publishing
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Scout Marketplace Publishing',
                description: `Publish "${req.body.companyName}" to Scout marketplace`,
              },
              unit_amount: 900, // $9.00 in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/scout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/project-setup`,
        metadata: {
          userId: userId,
          projectData: JSON.stringify(req.body), // Store project data for later processing
          type: 'scout_publishing'
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating Scout payment:', error);
      res.status(500).json({ error: 'Failed to create payment session' });
    }
  });

  // Handle successful Scout payment and publish to marketplace
  app.get('/api/scout-payment-success', async (req, res) => {
    try {
      const { session_id } = req.query;
      
      if (!session_id) {
        return res.status(400).json({ error: 'Session ID required' });
      }

      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Payment not completed' });
      }

      // Get project data from metadata
      const projectData = JSON.parse(session.metadata?.projectData || '{}');
      
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        return res.status(500).json({ error: 'Airtable configuration missing' });
      }

      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      
      // Create record in Scout table
      const record = await base('Scout').create({
        'Company Name': projectData.companyName,
        'Description': projectData.description,
        'Project Stage': projectData.projectStage,
        'Ticker Launched': projectData.tickerLaunched,
        'DEX Screener URL': projectData.dexScreenerUrl,
        'Amount Raising': projectData.amountRaising,
        'Valuation': projectData.valuation,
        'Ecosystem': projectData.ecosystem,
        'Vertical': projectData.vertical,
        'Twitter URL': projectData.twitterUrl,
        'Founder Twitter URL': projectData.founderTwitterUrl,
        'LinkedIn URL': projectData.linkedinUrl,
        'Website URL': projectData.websiteUrl,
        'Revenue Generating': projectData.revenueGenerating,
        'Logo URL': projectData.logoUrl,
        'Pitch Deck URL': projectData.pitchDeckUrl,
        'Data Room URL': projectData.dataRoomUrl,
        'Traction': projectData.traction,
        'Votes': 0,
        'Created': new Date().toISOString(),
        'Payment Session ID': session_id,
        'Payment Status': 'Paid'
      });

      console.log(`✅ Successfully published project ${projectData.companyName} to Scout marketplace after payment`);
      res.json({ success: true, recordId: record.id });
    } catch (error) {
      console.error('Error processing Scout payment success:', error);
      res.status(500).json({ error: 'Failed to process payment success' });
    }
  });

  // Public upload endpoint for VC signup (no authentication required)
  app.post('/api/upload/vc-logo', upload.single('logo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        fileUrl,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Error uploading VC logo:', error);
      res.status(500).json({ message: 'Failed to upload VC logo' });
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

  // Cold investor routes
  app.get('/api/cold-investors', async (req, res) => {
    try {
      const investors = await storage.getAllColdInvestors();
      res.json(investors);
    } catch (error) {
      console.error("Error fetching cold investors:", error);
      res.status(500).json({ message: "Failed to fetch cold investors" });
    }
  });

  app.get('/api/cold-investors/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const investor = await storage.getColdInvestorBySlug(slug);
      
      if (!investor) {
        return res.status(404).json({ message: "Fund not found" });
      }

      const decisionMakers = await storage.getDecisionMakersByFund(investor.id);
      res.json({ fund: investor, decisionMakers });
    } catch (error) {
      console.error("Error fetching cold investor details:", error);
      res.status(500).json({ message: "Failed to fetch fund details" });
    }
  });

  app.get('/api/check-decision-maker-unlock', async (req, res) => {
    try {
      const { email, decisionMakerId } = req.query;
      
      if (!email || !decisionMakerId) {
        return res.status(400).json({ message: "Email and decision maker ID are required" });
      }

      const hasUnlocked = await storage.hasEmailUnlockedDecisionMaker(
        email as string, 
        parseInt(decisionMakerId as string)
      );
      res.json({ hasUnlocked });
    } catch (error) {
      console.error("Error checking decision maker unlock:", error);
      res.status(500).json({ message: "Failed to check unlock status" });
    }
  });

  // Create payment intent for decision maker unlock
  app.post('/api/create-decision-maker-payment', async (req, res) => {
    try {
      const { email, decisionMakerId } = req.body;
      
      if (!email || !decisionMakerId) {
        return res.status(400).json({ message: "Email and decision maker ID are required" });
      }

      // Check if already unlocked
      const hasUnlocked = await storage.hasEmailUnlockedDecisionMaker(email, decisionMakerId);
      if (hasUnlocked) {
        return res.status(400).json({ message: "Decision maker already unlocked" });
      }

      // Create payment intent for $1
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 100, // $1 in cents
        currency: "usd",
        metadata: {
          decisionMakerId: decisionMakerId.toString(),
          email,
          paymentType: "cold_scout",
        },
      });

      res.json({ 
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Confirm decision maker unlock after successful payment
  app.post('/api/confirm-decision-maker-unlock', async (req, res) => {
    try {
      const { paymentIntentId, email, decisionMakerId } = req.body;
      
      if (!paymentIntentId || !email || !decisionMakerId) {
        return res.status(400).json({ message: "Payment intent ID, email, and decision maker ID are required" });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment has not been completed" });
      }

      // Check if unlock record already exists
      const hasUnlocked = await storage.hasEmailUnlockedDecisionMaker(email, decisionMakerId);
      if (hasUnlocked) {
        return res.status(400).json({ message: "Decision maker already unlocked" });
      }

      // Create unlock record
      await storage.createDecisionMakerUnlock({
        email,
        decisionMakerId,
        amount: 100,
        stripePaymentIntentId: paymentIntentId,
        status: "completed",
      });

      res.json({ 
        success: true,
        message: "Decision maker unlocked successfully"
      });
    } catch (error) {
      console.error("Error confirming unlock:", error);
      res.status(500).json({ message: "Failed to confirm unlock" });
    }
  });



  // VC unlock payment endpoint
  app.post('/api/create-vc-unlock-payment', async (req: any, res) => {
    try {
      const { vcId, vcType, email, amount } = req.body;
      
      if (!vcId || !vcType || !email || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if already unlocked
      const hasUnlocked = await storage.hasEmailUnlockedVC(email, vcId, vcType);
      if (hasUnlocked) {
        return res.status(400).json({ message: "VC already unlocked for this email" });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          vcId: vcId.toString(),
          vcType,
          email,
          paymentType: "verified_vc",
        },
      });

      // Create unlock record (for demo, mark as completed immediately)
      await storage.createVCUnlock({
        email,
        vcId,
        vcType,
        amount,
        paymentType: "verified_vc",
        stripePaymentIntentId: paymentIntent.id,
        status: "completed",
      });

      // Add email to Beehiiv newsletter
      try {
        await addToBeehiivNewsletter(email);
      } catch (beehiivError) {
        console.error('Error adding to Beehiiv during VC unlock:', beehiivError);
      }

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        success: true
      });
    } catch (error) {
      console.error("Error creating VC unlock payment:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  // Check VC unlock status endpoint
  app.get('/api/check-vc-unlock', async (req: any, res) => {
    try {
      const { email, vcId, vcType } = req.query;
      
      if (!email || !vcId || !vcType) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const hasUnlocked = await storage.hasEmailUnlockedVC(email, parseInt(vcId), vcType);
      res.json({ hasUnlocked });
    } catch (error) {
      console.error("Error checking VC unlock status:", error);
      res.status(500).json({ message: "Error checking unlock status" });
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

  // Ping VC requests submission endpoint
  app.post('/api/submit-request', async (req, res) => {
    try {
      const { name, email, message, category } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      const request = {
        id: Date.now().toString(),
        name: name || 'Anonymous',
        email: email || 'Not provided',
        message,
        category: category || 'General',
        timestamp: new Date().toISOString()
      };

      requests.push(request);
      console.log("📩 New Ping VC Request:", request);

      res.json({ success: true, message: "Thanks for your feedback! We'll review it soon." });
    } catch (error) {
      console.error("Error submitting request:", error);
      res.status(500).json({ message: "Failed to submit request" });
    }
  });

  // Admin endpoint to view requests (development only)
  app.get('/api/requests', async (req, res) => {
    try {
      // In production, add authentication check here
      res.json(requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // Gamification API endpoints
  
  // Create VC request tracking entry
  app.post('/api/vc-request', async (req: any, res) => {
    try {
      const { vcId, vcType, founderEmail, founderId, tags, requestType, amount } = req.body;
      
      if (!vcId || !vcType || !founderEmail || !requestType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      await storage.createVCRequest({
        vcId,
        vcType,
        founderEmail,
        userId: founderId || null,
        founderScore: 50, // Keep field for backward compatibility but not used
        tags: tags || [],
        requestType,
        amount: amount || null,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error creating VC request:", error);
      res.status(500).json({ message: "Failed to track VC request" });
    }
  });

  // Get VC stats for gamification display
  app.get('/api/vc-stats/:vcId/:vcType', async (req: any, res) => {
    try {
      const { vcId, vcType } = req.params;
      
      if (!vcId || !vcType) {
        return res.status(400).json({ message: "VC ID and type are required" });
      }

      const stats = await storage.getVCStats(vcId, vcType);
      
      // For Airtable VCs, fetch additional data from Airtable if needed
      if (vcType === 'airtable') {
        // You can extend this to fetch openToAngel and donatesToCharity from Airtable
        // For now, we'll use the database stats
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching VC stats:", error);
      res.status(500).json({ message: "Failed to fetch VC stats" });
    }
  });

  // Get top VCs leaderboard
  app.get('/api/top-vcs', async (req: any, res) => {
    try {
      const topVCs = await storage.getTopVCs();
      res.json(topVCs);
    } catch (error) {
      console.error("Error fetching top VCs:", error);
      res.status(500).json({ message: "Failed to fetch top VCs" });
    }
  });

  // Get user request history (requires authentication)
  app.get('/api/my-history', async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const requestHistory = await storage.getUserRequestHistory(user.email);
      const vcUnlocks = await storage.getUserVCUnlocks(user.email);

      res.json({
        requests: requestHistory,
        unlocks: vcUnlocks,
        totalRequests: requestHistory.length,
        totalUnlocks: vcUnlocks.length,
      });
    } catch (error) {
      console.error("Error fetching user history:", error);
      res.status(500).json({ message: "Failed to fetch user history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function sendVCThankYouEmail(vc: any): Promise<void> {
  try {
    // Add the VC to Beehiiv newsletter first
    if (vc.email) {
      await addToBeehiivNewsletter(vc.email, vc.partnerName);
      console.log(`✅ Added ${vc.email} to Beehiiv newsletter`);
    }

    // Send notification to Ping VC team 
    await sendVCNotificationToPingTeam(vc);
    
    console.log(`✅ Successfully processed email notifications for VC: ${vc.partnerName} from ${vc.fundName}`);
  } catch (error) {
    console.error("Error sending VC emails:", error);
    throw error;
  }
}

async function sendVCNotificationToPingTeam(vc: any): Promise<void> {
  try {
    // For now, log the notification that would be sent to the team
    // In production, you could send this via email service or Slack webhook
    console.log(`📧 NEW VC APPLICATION NOTIFICATION:`);
    console.log(`👤 Name: ${vc.partnerName}`);
    console.log(`🏢 Fund: ${vc.fundName}`);
    console.log(`📧 Email: ${vc.email}`);
    console.log(`💰 Price: $${vc.price / 100}`);
    console.log(`🎯 Sectors: ${Array.isArray(vc.sectors) ? vc.sectors.join(', ') : vc.sectors}`);
    console.log(`📈 Stages: ${Array.isArray(vc.stage) ? vc.stage.join(', ') : vc.stage}`);
    console.log(`🔗 Meeting Link: ${vc.meetingLink}`);
    console.log(`📍 Location: ${vc.location}`);
    console.log(`📅 Submitted: ${new Date().toLocaleString()}`);
    console.log(`🔍 Review required in admin panel`);
    
    // You could also send this to a Slack webhook, email service, or notification system
    // Example: await sendSlackNotification(notificationData);
    // Example: await sendEmailToTeam(notificationData);
  } catch (error) {
    console.error("Error sending team notification:", error);
    throw error;
  }
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
