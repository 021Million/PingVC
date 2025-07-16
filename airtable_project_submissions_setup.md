# Airtable Project Submissions Setup Guide

## Required Airtable Table: "Project Submissions"

This table captures ALL project setup submissions from the `/project-setup` page, including drafts and published projects.

### Required Fields:

#### **Founder Information**
- **Founder Name** (Single line text) - Founder's full name
- **Founder Email** (Email) - Founder's email address
- **User ID** (Single line text) - Internal user identifier

#### **Project Basics**
- **Company Name** (Single line text) - Project/company name
- **Description** (Long text) - Detailed project description
- **Logo URL** (URL) - Project logo image URL
- **Website URL** (URL) - Project website
- **Project Stage** (Single select) - Current development stage

#### **Social & Contact Links**
- **Twitter URL** (URL) - Project Twitter/X profile
- **LinkedIn URL** (URL) - Founder's LinkedIn profile
- **Founder Twitter URL** (URL) - Founder's personal Twitter/X
- **Pitch Deck URL** (URL) - Pitch deck link
- **Data Room URL** (URL) - Data room access link

#### **Technical Details**
- **Ecosystem** (Single select) - Blockchain ecosystem
- **Vertical** (Single select) - Industry vertical/category
- **Ticker Launched** (Single select) - "Yes" or "No"
- **DexScreener URL** (URL) - Token tracking URL if applicable
- **Revenue Generating** (Single select) - "Yes" or "No"

#### **Fundraising Information**
- **Amount Raising** (Number) - Target fundraising amount (USD)
- **Valuation** (Number) - Current valuation (USD)
- **Traction** (Long text) - User/revenue traction details

#### **Status & Metadata**
- **Submission Date** (Date & time) - When form was submitted
- **Submission Type** (Single select) - "Draft", "Published", "Setup Only"
- **Is Published** (Single select) - "Yes" or "No"
- **Is Visible** (Single select) - "Yes" or "No"
- **Source** (Single select) - "Project Setup Page"
- **Verification Status** (Single select) - "under_review", "verified", "rejected"
- **Verified At** (Date & time) - When project was verified by admin
- **Verification Notes** (Long text) - Admin notes about verification decision

### Field Options:

#### **Project Stage Options:**
- Idea
- MVP
- Beta
- Live
- Growth
- Scaling

#### **Ecosystem Options:**
- Ethereum
- Solana
- Polygon
- Binance Smart Chain
- Avalanche
- Cardano
- TON
- Sui
- Polkadot
- Cosmos
- Optimism
- Aptos
- Hedera
- Base
- Stellar

#### **Vertical Options:**
- AI/ML
- DeFi
- RWA
- Stablecoins
- Infrastructure
- Supply Chain
- Payments
- Identity
- DAO
- Healthcare
- Meme
- Energy
- Compute
- SocialFi
- Data
- Education
- Privacy

#### **Submission Type Options:**
- Draft
- Published
- Setup Only

#### **Source Options:**
- Project Setup Page
- Profile Page
- Admin Import

#### **Verification Status Options:**
- under_review
- verified 
- rejected

## Usage:

This table automatically captures:
1. **Initial Project Setups** - When founders first complete the project setup form
2. **Draft Saves** - Project information saved without publishing
3. **Published Projects** - Projects that go live in the marketplace
4. **Profile Updates** - Changes made through the profile page

### Data Flow:
- **Every submission** from `/project-setup` page saves to this table
- **Status tracking** shows progression from setup → draft → published
- **Complete project data** for lead generation and founder outreach
- **Source attribution** to track which form/page generated the submission

### Benefits:
- **Lead Generation**: Capture all founder interest, not just published projects
- **Funnel Analytics**: Track conversion from setup → publication
- **Outreach Data**: Complete founder contact and project information
- **Market Research**: See what types of projects founders are building

## Table Creation Steps:

1. **Go to your Airtable base**
2. **Click "+" to add new table**
3. **Name it "Project Submissions"**
4. **Add all fields above with exact names and types**
5. **Configure single select options as listed**
6. **Set up views for "Published Projects", "Draft Projects", "Recent Submissions"