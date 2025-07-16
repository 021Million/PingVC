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
  password: varchar("password"), // Hashed password for first-time setup
  hasSetPassword: boolean("has_set_password").default(false),
  userType: varchar("user_type").default("founder"), // 'founder', 'vc', 'angel'
  isAdmin: boolean("is_admin").default(false),
  profileCompleted: boolean("profile_completed").default(false),
  isApprovedInvestor: boolean("is_approved_investor").default(false), // For VCs/Angels - requires PingVC approval
  authProvider: varchar("auth_provider").default("email"), // 'email' or 'replit'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vcs = pgTable("vcs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  fundName: varchar("fund_name").notNull(),
  partnerName: varchar("partner_name").notNull(),
  email: varchar("email"),
  location: varchar("location").notNull(),
  position: varchar("position").notNull(),
  investmentTag: varchar("investment_tag").notNull(),
  fundDescription: text("fund_description").notNull(),
  bio: text("bio").notNull(),
  portfolioPerformance: text("portfolio_performance").notNull(),
  twitterUrl: varchar("twitter_url"),
  linkedinUrl: varchar("linkedin_url"),
  telegramUrl: varchar("telegram_url"),
  meetingUrl: varchar("meeting_url"), // Calendly or other meeting link
  stage: text("stage").array().notNull(), // Pre-Seed, Seed, Series A, Angel, etc.
  sectors: text("sectors").array().notNull(), // DeFi, Gaming, Infrastructure, etc.
  investmentThesis: text("investment_thesis").notNull(),
  contactType: varchar("contact_type").notNull().default("meeting"), // Always 'meeting' now
  contactHandle: varchar("contact_handle").notNull(), // Meeting link
  meetingLink: varchar("meeting_link").notNull(), // Meeting link
  price: integer("price").notNull(), // Price in cents
  logoUrl: varchar("logo_url"),
  weeklyIntroLimit: integer("weekly_intro_limit").default(5),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  donateToCharity: boolean("donate_to_charity").default(false),
  charityOfChoice: varchar("charity_of_choice"),
  isVentureCapital: boolean("is_venture_capital").default(false),
  isAngel: boolean("is_angel").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const founders = pgTable("founders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  
  // Founder & Project Basics
  founderName: varchar("founder_name"),
  companyName: varchar("company_name"),
  oneLineDescription: varchar("one_line_description"),
  description: text("description"), // Detailed description
  logoUrl: varchar("logo_url"), // Project logo
  websiteUrl: varchar("website_url"),
  twitterUrl: varchar("twitter_url"),
  email: varchar("email"), // Contact email for VCs
  
  // Team & Company Info
  teamSize: integer("team_size"),
  teamRoles: text("team_roles"), // Core team roles description
  location: varchar("location"), // City, Country or Remote
  
  // Ecosystem & Vertical
  ecosystem: varchar("ecosystem"), // e.g., "Ethereum", "Solana", "Polygon"
  vertical: varchar("vertical"), // e.g., "DeFi", "Gaming", "NFTs"
  
  // Fundraising Info
  isRaising: boolean("is_raising").default(false),
  roundType: varchar("round_type"), // Pre-Seed, Seed, Series A, etc.
  amountRaising: integer("amount_raising"), // Amount in USD
  valuation: varchar("valuation"), // Pre/Post valuation
  committedAmount: integer("committed_amount"), // Amount already soft-circled
  idealInvestorType: varchar("ideal_investor_type"), // Operator Angel, Micro VC, etc.
  
  // Additional Info
  traction: text("traction"),
  pitchDeckUrl: varchar("pitch_deck_url"),
  dataRoomUrl: varchar("data_room_url"),
  linkedinUrl: varchar("linkedin_url"),
  githubUrl: varchar("github_url"),
  lookingFor: text("looking_for"), // What are you looking for
  
  // New fields from Flask template
  revenueGenerating: varchar("revenue_generating"), // Yes/No/Soon
  stage: varchar("stage"), // Devnet, Testnet, Mainnet
  
  // Additional enhanced fields for expanded dashboard
  tokenLaunch: boolean("token_launch").default(false), // Yes/No for token launch
  ticker: varchar("ticker"), // Token ticker symbol (only if tokenLaunch = true)
  capitalRaisedToDate: integer("capital_raised_to_date"), // Amount in USD
  dau: integer("dau"), // Daily active users
  
  // Legacy/System fields
  profileImageUrl: varchar("profile_image_url"),
  isVisible: boolean("is_visible").default(false), // Paid visibility
  isPublished: boolean("is_published").default(false), // Whether project has been published via payment
  isFeatured: boolean("is_featured").default(false),
  featuredUntil: timestamp("featured_until"),
  upvotes: integer("upvotes").default(0),
  votes: integer("votes").default(0),
  
  // Verification system
  verificationStatus: varchar("verification_status").default("under_review"), // "under_review", "verified", "rejected"
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"), // Admin notes about verification
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey(), // Stripe payment intent ID
  founderId: integer("founder_id").references(() => founders.id),
  vcId: integer("vc_id").references(() => vcs.id),
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency").default("usd"),
  paymentType: varchar("payment_type").notNull(), // 'project_visibility' or 'vc_unlock'
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").notNull().default("pending"), // pending, completed, failed
  introTemplate: text("intro_template"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectVotes = pgTable("project_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  founderId: integer("founder_id").references(() => founders.id).notNull(),
  email: varchar("email").notNull(), // Email address instead of userId to allow non-authenticated voting
  userId: varchar("user_id").references(() => users.id), // Optional - for authenticated users
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailSubmissions = pgTable("email_submissions", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  source: varchar("source").notNull(), // 'scout', 'ping', 'landing', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const vcUnlocks = pgTable("vc_unlocks", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  vcId: varchar("vc_id").notNull(), // Can reference either platform VCs (integers) or Airtable VC IDs (strings)
  vcType: varchar("vc_type").notNull(), // 'platform' or 'airtable'
  amount: integer("amount").notNull(), // Amount paid in cents
  paymentType: varchar("payment_type").notNull(), // 'verified_vc', 'cold_scout'
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cold Investor tables for new unlock system
export const coldInvestors = pgTable("cold_investors", {
  id: serial("id").primaryKey(),
  fundName: varchar("fund_name").notNull(),
  fundSlug: varchar("fund_slug").notNull().unique(), // Generated from fund name
  website: varchar("website"),
  investmentFocus: text("investment_focus"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const decisionMakers = pgTable("decision_makers", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name").notNull(),
  role: varchar("role").notNull(),
  linkedinUrl: varchar("linkedin_url"),
  twitterUrl: varchar("twitter_url"),
  fundId: integer("fund_id").references(() => coldInvestors.id),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const decisionMakerUnlocks = pgTable("decision_maker_unlocks", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  decisionMakerId: integer("decision_maker_id").references(() => decisionMakers.id),
  amount: integer("amount").default(100), // $1 in cents
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// VC Request Tracking for Gamification
export const vcRequests = pgTable("vc_requests", {
  id: serial("id").primaryKey(),
  vcId: varchar("vc_id").notNull(), // Airtable ID or platform VC ID
  vcType: varchar("vc_type").notNull(), // 'airtable' or 'platform'
  founderEmail: varchar("founder_email").notNull(),
  userId: varchar("user_id"), // Optional user ID if logged in
  founderScore: integer("founder_score").default(50), // Quality score 0-100
  tags: text("tags").array(), // Founder categories like ['AI infra', 'DePIN']
  requestType: varchar("request_type").notNull(), // 'unlock', 'booking_request'
  amount: integer("amount"), // Payment amount in cents for unlocks
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

export const coldInvestorsRelations = relations(coldInvestors, ({ many }) => ({
  decisionMakers: many(decisionMakers),
}));

export const decisionMakersRelations = relations(decisionMakers, ({ one, many }) => ({
  fund: one(coldInvestors, {
    fields: [decisionMakers.fundId],
    references: [coldInvestors.id],
  }),
  unlocks: many(decisionMakerUnlocks),
}));

export const decisionMakerUnlocksRelations = relations(decisionMakerUnlocks, ({ one }) => ({
  decisionMaker: one(decisionMakers, {
    fields: [decisionMakerUnlocks.decisionMakerId],
    references: [decisionMakers.id],
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
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertEmailSubmissionSchema = createInsertSchema(emailSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertVCUnlockSchema = createInsertSchema(vcUnlocks).omit({
  id: true,
  createdAt: true,
});

export const insertColdInvestorSchema = createInsertSchema(coldInvestors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDecisionMakerSchema = createInsertSchema(decisionMakers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDecisionMakerUnlockSchema = createInsertSchema(decisionMakerUnlocks).omit({
  id: true,
  createdAt: true,
});

export const insertVCRequestSchema = createInsertSchema(vcRequests).omit({
  id: true,
  createdAt: true,
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
export type EmailSubmission = typeof emailSubmissions.$inferSelect;
export type InsertEmailSubmission = z.infer<typeof insertEmailSubmissionSchema>;
export type VCUnlock = typeof vcUnlocks.$inferSelect;
export type InsertVCUnlock = z.infer<typeof insertVCUnlockSchema>;
export type ColdInvestor = typeof coldInvestors.$inferSelect;
export type InsertColdInvestor = z.infer<typeof insertColdInvestorSchema>;
export type DecisionMaker = typeof decisionMakers.$inferSelect;
export type InsertDecisionMaker = z.infer<typeof insertDecisionMakerSchema>;
export type DecisionMakerUnlock = typeof decisionMakerUnlocks.$inferSelect;
export type InsertDecisionMakerUnlock = z.infer<typeof insertDecisionMakerUnlockSchema>;
export type VCRequest = typeof vcRequests.$inferSelect;
export type InsertVCRequest = z.infer<typeof insertVCRequestSchema>;
