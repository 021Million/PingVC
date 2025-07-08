import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  profileCompleted: boolean("profile_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vcs = pgTable("vcs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  fundName: varchar("fund_name").notNull(),
  partnerName: varchar("partner_name").notNull(),
  stage: varchar("stage").notNull(), // Pre-Seed, Seed, Series A, etc.
  sectors: text("sectors").array().notNull(), // DeFi, Gaming, Infrastructure, etc.
  investmentThesis: text("investment_thesis").notNull(),
  contactType: varchar("contact_type").notNull(), // 'telegram' or 'meeting'
  contactHandle: varchar("contact_handle").notNull(), // Telegram handle or Calendly link
  price: integer("price").notNull(), // Price in cents
  weeklyIntroLimit: integer("weekly_intro_limit").default(5),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const founders = pgTable("founders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  companyName: varchar("company_name"),
  founderName: varchar("founder_name"),
  profileImageUrl: varchar("profile_image_url"),
  pitchDeckUrl: varchar("pitch_deck_url"),
  amountRaising: integer("amount_raising"), // Amount in USD
  traction: text("traction"),
  description: text("description"),
  ecosystem: varchar("ecosystem"), // e.g., "Ethereum", "Solana", "Polygon"
  vertical: varchar("vertical"), // e.g., "DeFi", "Gaming", "NFTs"
  dataRoomUrl: varchar("data_room_url"),
  linkedinUrl: varchar("linkedin_url"),
  twitterUrl: varchar("twitter_url"),
  websiteUrl: varchar("website_url"),
  githubUrl: varchar("github_url"),
  isFeatured: boolean("is_featured").default(false),
  featuredUntil: timestamp("featured_until"),
  upvotes: integer("upvotes").default(0),
  votes: integer("votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  founderId: integer("founder_id").references(() => founders.id),
  vcId: integer("vc_id").references(() => vcs.id),
  amount: integer("amount").notNull(), // Amount in cents
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").notNull().default("pending"), // pending, completed, failed
  introTemplate: text("intro_template"),
  rating: integer("rating"), // 1-5 star rating for the VC
  feedback: text("feedback"), // Optional feedback text
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectVotes = pgTable("project_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  founderId: integer("founder_id").references(() => founders.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  vcs: many(vcs),
  founders: many(founders),
}));

export const vcsRelations = relations(vcs, ({ one, many }) => ({
  user: one(users, {
    fields: [vcs.userId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const foundersRelations = relations(founders, ({ one, many }) => ({
  user: one(users, {
    fields: [founders.userId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  founder: one(founders, {
    fields: [payments.founderId],
    references: [founders.id],
  }),
  vc: one(vcs, {
    fields: [payments.vcId],
    references: [vcs.id],
  }),
}));

// Schemas for validation
export const insertVCSchema = createInsertSchema(vcs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFounderSchema = createInsertSchema(founders).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type VC = typeof vcs.$inferSelect;
export type InsertVC = z.infer<typeof insertVCSchema>;
export type Founder = typeof founders.$inferSelect;
export type InsertFounder = z.infer<typeof insertFounderSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
