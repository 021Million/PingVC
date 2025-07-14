import {
  users,
  vcs,
  founders,
  payments,
  projectVotes,
  emailSubmissions,
  vcUnlocks,
  coldInvestors,
  decisionMakers,
  decisionMakerUnlocks,
  type User,
  type UpsertUser,
  type VC,
  type InsertVC,
  type Founder,
  type InsertFounder,
  type Payment,
  type InsertPayment,
  type EmailSubmission,
  type InsertEmailSubmission,
  type VCUnlock,
  type InsertVCUnlock,
  type ColdInvestor,
  type InsertColdInvestor,
  type DecisionMaker,
  type InsertDecisionMaker,
  type DecisionMakerUnlock,
  type InsertDecisionMakerUnlock,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gt } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  completeUserProfile(id: string, profileData: { firstName: string; lastName: string }): Promise<User>;
  updateUserProfile(id: string, profileData: { firstName: string; lastName: string; email?: string }): Promise<User>;
  
  // Password operations
  setUserPassword(id: string, hashedPassword: string): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User>;
  updateUserAndPassword(id: string, profileData: { firstName: string; lastName: string; email?: string }, hashedPassword?: string): Promise<User>;
  
  // VC operations
  createVC(vc: InsertVC): Promise<VC>;
  getVCs(filters?: { stage?: string; sector?: string; verified?: boolean }): Promise<VC[]>;
  getVC(id: number): Promise<VC | undefined>;
  updateVCVerification(id: number, isVerified: boolean): Promise<VC>;
  getVCsByUserId(userId: string): Promise<VC[]>;
  
  // Founder operations
  getOrCreateFounder(userId: string): Promise<Founder>;
  getFounderById(id: number): Promise<Founder | undefined>;
  updateFounderProject(founderId: number, projectData: Partial<Founder>): Promise<Founder>;
  getFeaturedFounders(): Promise<Founder[]>;
  getFoundersByRanking(): Promise<Founder[]>;
  voteForProject(founderId: number, email: string, userId?: string): Promise<void>;
  unvoteForProject(founderId: number, email: string, userId?: string): Promise<void>;
  hasEmailVotedForProject(founderId: number, email: string): Promise<boolean>;
  canEmailVoteToday(email: string): Promise<boolean>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: string, status: string, introTemplate?: string): Promise<Payment>;
  getPaymentsByFounder(founderId: number): Promise<Payment[]>;
  hasFounderUnlockedVC(founderId: number, vcId: number): Promise<boolean>;
  
  // Email submission operations
  submitEmail(email: InsertEmailSubmission): Promise<EmailSubmission>;
  hasEmailAccess(email: string, source: string): Promise<boolean>;
  
  // VC unlock operations
  createVCUnlock(unlock: InsertVCUnlock): Promise<VCUnlock>;
  hasEmailUnlockedVC(email: string, vcId: number, vcType: string): Promise<boolean>;
  getVCUnlocksByEmail(email: string): Promise<VCUnlock[]>;
  
  // Cold investor operations
  getAllColdInvestors(): Promise<ColdInvestor[]>;
  getColdInvestorBySlug(slug: string): Promise<ColdInvestor | undefined>;
  getDecisionMakersByFund(fundId: number): Promise<DecisionMaker[]>;
  createDecisionMakerUnlock(unlock: InsertDecisionMakerUnlock): Promise<DecisionMakerUnlock>;
  hasEmailUnlockedDecisionMaker(email: string, decisionMakerId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async completeUserProfile(id: string, profileData: { firstName: string; lastName: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        profileCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profileData: { firstName: string; lastName: string; email?: string }): Promise<User> {
    const updateData: any = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      updatedAt: new Date(),
    };
    
    if (profileData.email) {
      updateData.email = profileData.email;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async setUserPassword(id: string, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        password: hashedPassword,
        hasSetPassword: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async updateUserAndPassword(id: string, profileData: { firstName: string; lastName: string; email?: string }, hashedPassword?: string): Promise<User> {
    const updateData: any = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      updatedAt: new Date(),
    };
    
    if (profileData.email) {
      updateData.email = profileData.email;
    }
    
    if (hashedPassword) {
      updateData.password = hashedPassword;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  // VC operations
  async createVC(vcData: InsertVC): Promise<VC> {
    const [vc] = await db.insert(vcs).values(vcData).returning();
    return vc;
  }

  async getVCs(filters?: { stage?: string; sector?: string; verified?: boolean }): Promise<VC[]> {
    let whereConditions = [eq(vcs.isActive, true)];
    
    if (filters?.verified !== undefined) {
      whereConditions.push(eq(vcs.isVerified, filters.verified));
    }
    
    if (filters?.stage) {
      whereConditions.push(sql`${filters.stage} = ANY(${vcs.stage})`);
    }
    
    if (filters?.sector) {
      whereConditions.push(sql`${filters.sector} = ANY(${vcs.sectors})`);
    }
    
    return await db
      .select()
      .from(vcs)
      .where(and(...whereConditions))
      .orderBy(desc(vcs.isVerified), desc(vcs.createdAt));
  }

  async getVC(id: number): Promise<VC | undefined> {
    const [vc] = await db.select().from(vcs).where(eq(vcs.id, id));
    return vc;
  }

  async updateVCVerification(id: number, isVerified: boolean): Promise<VC> {
    const [vc] = await db
      .update(vcs)
      .set({ isVerified, updatedAt: new Date() })
      .where(eq(vcs.id, id))
      .returning();
    return vc;
  }

  async getVCsByUserId(userId: string): Promise<VC[]> {
    return await db.select().from(vcs).where(eq(vcs.userId, userId));
  }

  // Founder operations
  async getOrCreateFounder(userId: string): Promise<Founder> {
    const [existingFounder] = await db
      .select()
      .from(founders)
      .where(eq(founders.userId, userId));
    
    if (existingFounder) {
      return existingFounder;
    }

    const [newFounder] = await db
      .insert(founders)
      .values({ userId })
      .returning();
    return newFounder;
  }

  async getFounderById(id: number): Promise<Founder | undefined> {
    const [founder] = await db.select().from(founders).where(eq(founders.id, id));
    return founder || undefined;
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values({
        id: paymentData.id || crypto.randomUUID(),
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        founderId: paymentData.founderId,
        vcId: paymentData.vcId,
        currency: paymentData.currency,
        stripePaymentIntentId: paymentData.stripePaymentIntentId,
        status: paymentData.status,
        introTemplate: paymentData.introTemplate
      })
      .returning();
    return payment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async updatePaymentStatus(id: string, status: string, introTemplate?: string): Promise<Payment> {
    const updateData: any = { status };
    if (introTemplate) {
      updateData.introTemplate = introTemplate;
    }
    
    const [payment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getPaymentsByFounder(founderId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.founderId, founderId))
      .orderBy(desc(payments.createdAt));
  }

  async hasFounderUnlockedVC(founderId: number, vcId: number): Promise<boolean> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.founderId, founderId),
          eq(payments.vcId, vcId),
          eq(payments.status, "completed")
        )
      );
    return !!payment;
  }

  async updateFounderProject(founderId: number, projectData: Partial<Founder>): Promise<Founder> {
    const [founder] = await db
      .update(founders)
      .set({
        ...projectData,
        createdAt: sql`${founders.createdAt}`, // Keep original created date
      })
      .where(eq(founders.id, founderId))
      .returning();
    return founder;
  }

  async getFeaturedFounders(): Promise<Founder[]> {
    return await db
      .select()
      .from(founders)
      .where(eq(founders.isFeatured, true))
      .orderBy(desc(founders.upvotes))
      .limit(10);
  }

  async getFoundersByRanking(): Promise<Founder[]> {
    return await db
      .select()
      .from(founders)
      .orderBy(desc(founders.upvotes), desc(founders.createdAt));
  }

  async voteForProject(founderId: number, email: string, userId?: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Insert vote
      await tx.insert(projectVotes).values({
        founderId,
        email,
        userId,
      });
      
      // Increment upvote count
      await tx
        .update(founders)
        .set({
          upvotes: sql`${founders.upvotes} + 1`,
        })
        .where(eq(founders.id, founderId));
    });
  }

  async unvoteForProject(founderId: number, email: string, userId?: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Remove vote
      await tx
        .delete(projectVotes)
        .where(and(
          eq(projectVotes.founderId, founderId),
          eq(projectVotes.email, email)
        ));
      
      // Decrement upvote count
      await tx
        .update(founders)
        .set({
          upvotes: sql`${founders.upvotes} - 1`,
        })
        .where(eq(founders.id, founderId));
    });
  }

  async hasEmailVotedForProject(founderId: number, email: string): Promise<boolean> {
    const [vote] = await db
      .select()
      .from(projectVotes)
      .where(and(
        eq(projectVotes.founderId, founderId),
        eq(projectVotes.email, email)
      ))
      .limit(1);
    return !!vote;
  }

  async canEmailVoteToday(email: string): Promise<boolean> {
    // Check if email has voted in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentVote] = await db
      .select()
      .from(projectVotes)
      .where(and(
        eq(projectVotes.email, email),
        gt(projectVotes.createdAt, oneDayAgo)
      ))
      .limit(1);
    return !recentVote; // Can vote if no recent vote found
  }

  // Email submission operations
  async submitEmail(emailData: InsertEmailSubmission): Promise<EmailSubmission> {
    const [submission] = await db
      .insert(emailSubmissions)
      .values(emailData)
      .onConflictDoUpdate({
        target: emailSubmissions.email,
        set: {
          source: emailData.source,
        },
      })
      .returning();
    return submission;
  }

  async hasEmailAccess(email: string, source: string): Promise<boolean> {
    const [submission] = await db
      .select()
      .from(emailSubmissions)
      .where(and(eq(emailSubmissions.email, email), eq(emailSubmissions.source, source)));
    return !!submission;
  }

  // VC unlock operations
  async createVCUnlock(unlockData: InsertVCUnlock): Promise<VCUnlock> {
    const [unlock] = await db
      .insert(vcUnlocks)
      .values(unlockData)
      .returning();
    return unlock;
  }

  async hasEmailUnlockedVC(email: string, vcId: number, vcType: string): Promise<boolean> {
    const [unlock] = await db
      .select()
      .from(vcUnlocks)
      .where(and(
        eq(vcUnlocks.email, email), 
        eq(vcUnlocks.vcId, vcId),
        eq(vcUnlocks.vcType, vcType),
        eq(vcUnlocks.status, "completed")
      ))
      .limit(1);
    
    return !!unlock;
  }

  async getVCUnlocksByEmail(email: string): Promise<VCUnlock[]> {
    return await db
      .select()
      .from(vcUnlocks)
      .where(eq(vcUnlocks.email, email))
      .orderBy(desc(vcUnlocks.createdAt));
  }

  // Cold investor operations
  async getAllColdInvestors(): Promise<ColdInvestor[]> {
    return await db
      .select()
      .from(coldInvestors)
      .orderBy(coldInvestors.fundName);
  }

  async getColdInvestorBySlug(slug: string): Promise<ColdInvestor | undefined> {
    const [investor] = await db
      .select()
      .from(coldInvestors)
      .where(eq(coldInvestors.fundSlug, slug))
      .limit(1);
    return investor;
  }

  async getDecisionMakersByFund(fundId: number): Promise<DecisionMaker[]> {
    return await db
      .select()
      .from(decisionMakers)
      .where(and(
        eq(decisionMakers.fundId, fundId),
        eq(decisionMakers.isPublic, true)
      ))
      .orderBy(decisionMakers.role, decisionMakers.fullName);
  }

  async createDecisionMakerUnlock(unlockData: InsertDecisionMakerUnlock): Promise<DecisionMakerUnlock> {
    const [unlock] = await db
      .insert(decisionMakerUnlocks)
      .values(unlockData)
      .returning();
    return unlock;
  }

  async hasEmailUnlockedDecisionMaker(email: string, decisionMakerId: number): Promise<boolean> {
    const [unlock] = await db
      .select()
      .from(decisionMakerUnlocks)
      .where(and(
        eq(decisionMakerUnlocks.email, email),
        eq(decisionMakerUnlocks.decisionMakerId, decisionMakerId),
        eq(decisionMakerUnlocks.status, "completed")
      ))
      .limit(1);
    
    return !!unlock;
  }
}

export const storage = new DatabaseStorage();
