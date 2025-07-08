import {
  users,
  vcs,
  founders,
  payments,
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
  
  // VC operations
  createVC(vc: InsertVC): Promise<VC>;
  getVCs(filters?: { stage?: string; sector?: string; verified?: boolean }): Promise<VC[]>;
  getVC(id: number): Promise<VC | undefined>;
  updateVCVerification(id: number, isVerified: boolean): Promise<VC>;
  getVCsByUserId(userId: string): Promise<VC[]>;
  
  // Founder operations
  getOrCreateFounder(userId: string): Promise<Founder>;
  
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
    const [payment] = await db.insert(payments).values(paymentData).returning();
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
}

export const storage = new DatabaseStorage();
