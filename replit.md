# Ping Me - VC Contact Marketplace

## Overview

Ping Me is a web application that connects startup founders with venture capitalists through a paid contact marketplace. Founders can browse verified VC profiles, pay to unlock contact information, and receive AI-generated intro templates. VCs can list their profiles with custom pricing and contact preferences (Telegram or meeting links). The platform includes a verification system where VCs must be approved by admins before appearing publicly.

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

### Environment Variables
- `DATABASE_URL`: Neon PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (client-side)
- `OPENAI_API_KEY`: OpenAI API key for GPT integration
- `SESSION_SECRET`: Express session encryption secret
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OAuth issuer URL (defaults to Replit)

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