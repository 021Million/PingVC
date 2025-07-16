# Ping VC - VC Contact Marketplace

## Overview

Ping VC is a web application that connects startup founders with venture capitalists through a paid contact marketplace. Founders can browse verified VC profiles, pay to unlock contact information, and receive AI-generated intro templates. VCs can list their profiles with custom pricing and contact preferences (Telegram or meeting links). The platform includes a verification system where VCs must be approved by admins before appearing publicly.

## System Architecture

The application follows a full-stack monolithic architecture with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Database Schema
- **Users**: Core user profiles (required for Replit Auth) with admin role support
- **VCs**: Venture capitalist profiles with fund details, sectors, custom pricing, and verification status
- **Founders**: Founder-specific profiles linked to users
- **Payments**: Transaction records for unlocked VC contacts with intro templates
- **Email Submissions**: Stores email addresses for Scout page access with source tracking
- **Sessions**: Session storage (required for Replit Auth)

### Key Features
- **VC Self-Signup with Verification**: VCs can sign up and create their profiles, which are then reviewed by admins before going live
- **Custom Pricing**: Each VC sets their own price for intros (not fixed at $49)
- **Contact Type Options**: VCs can choose between Telegram handles or meeting links  
- **Admin Verification System**: Admin panel to approve/reject VC applications with verified checkmarks
- **AI-Generated Templates**: Personalized intro messages created by OpenAI based on VC investment focus
- **Payment Integration**: Full Stripe integration for secure payment processing
- **Founder Project Publishing**: Founders can save project details as drafts or pay $9 to publish and make them visible in Scout marketplace
- **Draft/Publish Workflow**: Two-tier system where founders can save privately or pay to go public
- **Email Gate for Scout**: Users must provide email to access the Scout marketplace, with remember functionality
- **User Authentication**: Replit Auth integration with session management
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS and shadcn/ui components

### Authentication System
- Replit Auth integration with OAuth/OpenID Connect
- Session-based authentication with PostgreSQL persistence
- Admin role support for platform management
- Protected routes and API endpoints

### Payment Integration
- Stripe integration for payment processing
- Support for both one-time payments and subscription models
- Payment confirmation flow with intro template generation

### AI Integration
- OpenAI API integration for generating personalized intro templates
- Custom prompt engineering for VC introduction messages

## Data Flow

1. **User Registration**: Users sign in via Replit Auth, creating user records
2. **VC Onboarding**: VCs complete profile setup with fund details and contact preferences
3. **Founder Project Setup**: Founders can create and save project details as drafts in their profile
4. **Project Publishing**: Founders pay $9 to make their projects visible in Scout marketplace
5. **Browse & Filter**: Founders browse verified VC profiles with stage/sector filters
6. **Payment Flow**: Founders initiate payment via Stripe checkout for VC contact access
7. **Contact Unlock**: Successful payment unlocks VC contact info and generates AI intro template
8. **Admin Management**: Admins verify VC profiles and manage platform content

## External Dependencies

### Required Services
- **Neon Database**: PostgreSQL hosting with connection pooling
- **Stripe**: Payment processing and checkout sessions
- **OpenAI**: AI-powered intro template generation
- **Replit Auth**: Authentication and user management
- **Beehiiv**: Newsletter subscription management for email marketing
- **Airtable**: VC signup tracking and booking request management

### Environment Variables
- `DATABASE_URL`: Neon PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (client-side)
- `OPENAI_API_KEY`: OpenAI API key for GPT integration
- `SESSION_SECRET`: Express session encryption secret
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OAuth issuer URL (defaults to Replit)
- `BEEHIIV_API_KEY`: Beehiiv API key for newsletter subscriptions
- `AIRTABLE_API_KEY`: Airtable API key for VC signup tracking
- `AIRTABLE_BASE_ID`: Airtable base ID for data storage

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend development
- Express server with tsx for TypeScript execution
- Database migrations managed via Drizzle Kit

### Production
- Frontend built to static assets via Vite
- Backend bundled via esbuild for Node.js execution
- Single-server deployment serving both frontend and API
- Database schema managed through migration files

### Build Commands
- `npm run dev`: Development mode with hot reload
- `npm run build`: Production build (frontend + backend)
- `npm run start`: Start production server
- `npm run db:push`: Apply database schema changes

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 08, 2025. Initial setup
- July 08, 2025. Added founder project publishing system with $9 payment for marketplace visibility
- July 10, 2025. Implemented email gate for Scout page with database storage and remember functionality
- July 10, 2025. Fixed footer navigation links to properly route to Terms, Privacy Policy, and Support pages
- July 10, 2025. Added expanded ecosystem options (Binance Smart Chain, Avalanche, Cardano, TON, Sui, Polkadot, Cosmos, Optimism, Apotos, Hedera, Base, Stellar) and vertical options (Supply Chain, Payments, Identity, DAO, Healthcare, Meme, Energy, Compute, SocialFi, Data, Education, Privacy) to Scout filters and project setup forms
- July 11, 2025. Implemented comprehensive user type selection system with Founder, VC, and Angel investor roles
- July 11, 2025. Enhanced founder profile with project draft functionality and $9 publishing workflow via Stripe checkout
- July 11, 2025. Removed account type display from profile interface and streamlined project management experience
- July 11, 2025. Added password management system for first-time signin with database storage, API routes, settings page, and secure bcrypt hashing
- July 11, 2025. Added password reset functionality to settings page allowing users to reset passwords without current password verification
- July 11, 2025. Added Ping button to all header navigation for easier access to VC marketplace
- July 13, 2025. Enhanced VC signup form with multi-select checkboxes for sectors and investment stages, added Angel option, removed Multi-Stage option
- July 13, 2025. Updated Ping page Investment Stage filter to include Angel option and remove Series C+ option
- July 13, 2025. Completed Ping button integration across all page headers for consistent navigation
- July 13, 2025. Implemented uniform shared header component across all pages with consistent styling, navigation, and authentication controls
- July 13, 2025. Added comprehensive image upload functionality for both founders (project logos) and VCs (fund logos) with multer file handling
- July 13, 2025. Moved ranking badge from top-right to top-left in Scout project thumbnails
- July 13, 2025. Updated landing page to display top 3 projects from Scout with community upvote counts and removed trending arrows
- July 13, 2025. Integrated Airtable to display verified and unverified VCs on /ping page with dedicated sections for "Verified Investors" and "Community Curated VCs"
- July 13, 2025. Implemented dedicated project detail pages (/project/:id) that display complete founder information when clicking Scout thumbnails
- July 13, 2025. Updated sector filters changing "NFTs" to "Stablecoins" and "Gaming" to "RWA" across all components and seed data
- July 13, 2025. Restructured Ping page to clearly separate "Verified Investors" section (including VCs, Angels, and Community VCs/DAOs/Syndicates verified by ping team) from "VC Scout" section (platform VCs)
- July 13, 2025. Implemented VC unlock paywall system with $5 unlock for verified investors, email-based access tracking, new database schema for VC unlocks, API endpoints for payment processing, and modal components for seamless unlock experience
- July 13, 2025. Integrated full Stripe payment processing for Cold Investor Scout $1 decision maker unlocks with proper payment flow, confirmation system, and dedicated payment modal component
- July 13, 2025. Expanded Airtable VCs table schema to include comprehensive investor data: email, X profile, Telegram, Meeting/Calendly Link, Investment Stage, Primary Sector, Investment Thesis, Price, and Limit fields for enhanced investor profiles and dynamic pricing
- July 13, 2025. Updated landing page and home page to pull VC thumbnails from Airtable verified investors instead of platform VCs, ensuring all "Connected VCs & Angels" sections display curated investors from the Ping page's verified investor database
- July 13, 2025. Removed all email access blocking from the application including email gates, email submission requirements, and related backend routes. Users now have immediate access to all content without email verification for Scout, Ping, and VCs pages.
- July 14, 2025. Completely removed VCs page (/vcs) and ForVCs page (/for-vcs) from the application. Updated all navigation links and references to redirect to the Ping page (/ping) which now serves as the main VC discovery page. Removed routes from App.tsx, deleted page files, and updated header components, pricing page, landing page, and how-it-works page to remove broken links.
- July 14, 2025. Removed Pricing page (/pricing) and all "For Founders" navigation references from the application. Deleted pricing page file, removed pricing routes from App.tsx, and updated header components and footer sections in landing page, home page, and how-it-works page to remove references to pricing and "For Founders" sections. Simplified navigation to focus on core marketplace functionality (Scout and Ping).
- July 14, 2025. Implemented simplified funnel architecture based on user specification: (1) Landing page with clear value proposition "Connect with real investors. Instantly." (2) New VCs marketplace page (/vcs) with grid layout, filtering, and pricing display (3) Individual VC profile pages (/vc/:id) for connection flow. Updated all navigation links to redirect from /ping to /vcs as the main investor marketplace. Streamlined copy to be crisp and direct following "Miss AI x Greg Isenberg" style.
- July 14, 2025. Added charity donation option to VC signup form with checkbox to donate earnings to charity, text input for charity of choice, and note explaining Ping VC will handle donations and provide receipts. Updated database schema with donate_to_charity and charity_of_choice fields.
- July 14, 2025. Removed Scout page (/scout) from the application completely. Deleted scout.tsx file, removed all Scout routes from App.tsx, and updated navigation in header components and footer sections to remove Scout links. Simplified navigation to focus only on the VC marketplace.
- July 14, 2025. Implemented comprehensive email/password authentication system alongside existing Replit Auth. Created new auth page (/auth) with login and registration forms, added bcrypt password hashing, database schema updates for auth provider tracking, and unified authentication hook that works with both systems. Users can now register directly without Replit accounts while maintaining backward compatibility.
- July 14, 2025. Completely redesigned Free Directory page (/directory) as founder-friendly Web3 VC utility. Transformed from booking-focused page to free public directory with "The Ultimate Web3 VC Directory for Founders" branding. Features clean VC cards showing name, fund, focus areas, investment stages, and social links (Twitter/website only). Includes advanced search and filtering, SEO-friendly copy, and soft upsell to premium contact unlock features. No login required - pure value-first tool for founders.
- July 14, 2025. Removed Replit sign-in option from auth page to create pure email/password authentication experience, eliminating dependency on external authentication providers for new users.
- July 14, 2025. Implemented unified VC discovery and booking system with new Browse VCs page (/browse-vcs). Merged free directory functionality with paid booking flow - verified VCs show "Book Call" buttons with Stripe integration, unverified VCs show "Request Call" buttons that notify the Ping VC team. Added comprehensive filtering by verification status, investment stage, and sector. Created new API endpoints /api/browse-vcs and /api/request-call for the unified experience.
- July 14, 2025. Removed Free Directory link from header navigation to streamline user experience and focus on the unified Browse VCs page which now serves both discovery and booking functions.
- July 14, 2025. Updated website branding from "Ping Me" to "Ping VC" across all frontend components, backend routes, email templates, and documentation to better reflect the VC-focused nature of the platform.
- July 14, 2025. Implemented unverified investor display and booking request system. Added unverified VCs to the platform with orange "Unverified" badges, created RequestCallModal component for manual introduction requests, updated backend to save booking requests to new Airtable "Booking Requests" table with founder details for cold outreach data. Both verified and unverified investors now display in separate sections on VCs page with appropriate CTAs (verified = instant booking, unverified = request introduction).
- July 14, 2025. Updated button text on VCs page to show "Connect" for verified investors and "Request" for unverified investors to clarify user actions. Enhanced social links on VC detail pages with prominent placement in both header and Professional Background sections.
- July 14, 2025. Added social media icons (LinkedIn, X, Website) to VC cards on VCs page, positioned as floating icons in top-right corner. Removed price display for unverified investors while keeping it for verified investors to differentiate paid vs. request-based connections.
- July 14, 2025. Repositioned social media icons to bottom-left of VC cards aligned with Connect/Request buttons. Added Fund Website as fourth social link option with purple styling and ExternalLink icon. Updated VC detail page sections: changed "Professional Background" to "Investment Thesis" and added new "Portfolio Performance" section.
- July 15, 2025. Integrated Beehiiv newsletter subscription system for automatic email capture across all user interactions (VC requests, unlock payments, newsletter signups). Added Airtable integration for VC signup tracking with automatic storage in "VC Signups" table. Created dedicated /api/newsletter-signup endpoint for seamless email marketing automation. All email interactions now automatically subscribe users to Ping VC newsletter and track engagement data.
- July 15, 2025. Removed community projects marketplace section from both landing page and home page to focus exclusively on founder-VC connections. Eliminated MarketplaceLanding component usage and featured projects queries to streamline the platform around direct investor booking rather than project showcasing.
- July 15, 2025. Simplified landing page with clear two-action focus: "View All VCs" and "Sign up as VC" buttons. Updated all navigation text to be consistent and removed marketplace references from footer. Deleted filter section component from home page to create cleaner, distraction-free experience focused on core VC booking functionality.
- July 16, 2025. Implemented comprehensive Airtable integration for founder project marketplace submissions. Added "Founder Projects" table integration that automatically captures all project data when founders publish to marketplace via $9 payment or admin visibility settings. Enhanced VC signup email notification system using Beehiiv newsletter integration with automatic subscription and team notifications. Created complete Airtable setup documentation for "VC Signups", "Booking Requests", and "Founder Projects" tables.