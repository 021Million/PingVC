import {
  users,
  vcs,
  founders,
  payments,
  projectVotes,
  type User,
  type UpsertUser,
  type VC,
  type InsertVC,
  type Founder,
  type InsertFounder,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  completeUserProfile(id: string, profileData: { firstName: string; lastName: string }): Promise<User>;
  updateUserProfile(id: string, profileData: { firstName: string; lastName: string }): Promise<User>;
  
  // VC operations
  createVC(vc: InsertVC): Promise<VC>;
  getVCs(filters?: { stage?: string; sector?: string; verified?: boolean }): Promise<VC[]>;
  getVC(id: number): Promise<VC | undefined>;
  updateVCVerification(id: number, isVerified: boolean): Promise<VC>;
  getVCsByUserId(userId: string): Promise<VC[]>;
  
  // Founder operations
  getOrCreateFounder(userId: string): Promise<Founder>;
  updateFounderProject(founderId: number, projectData: Partial<Founder>): Promise<Founder>;
  getFeaturedFounders(): Promise<Founder[]>;
  getFoundersByRanking(): Promise<Founder[]>;
  voteForProject(founderId: number, userId: string): Promise<void>;
  unvoteForProject(founderId: number, userId: string): Promise<void>;
  hasUserVotedForProject(founderId: number, userId: string): Promise<boolean>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: string, status: string, introTemplate?: string): Promise<Payment>;
  getPaymentsByFounder(founderId: number): Promise<Payment[]>;
  hasFounderUnlockedVC(founderId: number, vcId: number): Promise<boolean>;
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

  async updateUserProfile(id: string, profileData: { firstName: string; lastName: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
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
      whereConditions.push(eq(vcs.stage, filters.stage));
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
        introTemplate: paymentData.introTemplate,
        rating: paymentData.rating,
        feedback: paymentData.feedback
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

  async voteForProject(founderId: number, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Insert vote
      await tx.insert(projectVotes).values({
        founderId,
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

  async unvoteForProject(founderId: number, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Remove vote
      await tx
        .delete(projectVotes)
        .where(and(
          eq(projectVotes.founderId, founderId),
          eq(projectVotes.userId, userId)
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

  async hasUserVotedForProject(founderId: number, userId: string): Promise<boolean> {
    const [vote] = await db
      .select()
      .from(projectVotes)
      .where(and(
        eq(projectVotes.founderId, founderId),
        eq(projectVotes.userId, userId)
      ))
      .limit(1);
    return !!vote;
  }
}

export const storage = new DatabaseStorage();
