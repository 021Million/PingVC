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
  newPassword: varchar("new_password"), // Temporary field for password updates
  userType: varchar("user_type").default("founder"), // 'founder', 'vc', 'angel'
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
  email: varchar("email").notNull(),
  twitterUrl: varchar("twitter_url"),
  linkedinUrl: varchar("linkedin_url"),
  telegramUrl: varchar("telegram_url"),
  meetingUrl: varchar("meeting_url"), // Calendly or other meeting link
  stage: text("stage").array().notNull(), // Pre-Seed, Seed, Series A, Angel, etc.
  sectors: text("sectors").array().notNull(), // DeFi, Gaming, Infrastructure, etc.
  investmentThesis: text("investment_thesis").notNull(),
  contactType: varchar("contact_type").notNull(), // 'telegram', 'meeting', or 'both'
  contactHandle: varchar("contact_handle").notNull(), // Telegram handle or Calendly link
  telegramHandle: varchar("telegram_handle"), // Separate telegram handle when both options selected
  meetingLink: varchar("meeting_link"), // Separate meeting link when both options selected
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
  source: varchar("source").notNull(), // 'scout', 'landing', etc.
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
