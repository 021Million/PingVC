# Airtable Setup Guide for Ping Me

## Required Airtable Structure

### Table Name: "VCs"

### Required Fields:
- **Name** (Single line text) - VC/Angel investor name
- **Fund** (Single line text) - Investment fund name
- **Title** (Single line text) - Job title/role (e.g. General Partner, CEO, Managing Director)
- **Email** (Email) - Contact email address
- **Verified** (Checkbox) - True for verified investors
- **Twitter** (URL) - Twitter/X profile URL
- **X Profile** (URL) - X/Twitter profile URL (alternative field)
- **LinkedIn** (URL) - LinkedIn profile URL
- **Telegram** (Single line text) - Telegram handle
- **Meeting/Calendly Link** (URL) - Calendly or meeting booking link
- **Investment Stage** (Multiple select) - Pre-Seed, Seed, Series A, Series B, Angel
- **Primary Sector** (Multiple select) - DeFi, AI, Infrastructure, Gaming, etc.
- **Investment Thesis** (Long text) - Investment philosophy and focus areas
- **Image** (Attachment) - Upload professional headshot (JPEG format)
- **Price** (Number) - Unlock price (e.g. 5 for $5)
- **Limit** (Number) - Maximum number of unlocks per month
- **Bio** (Long text) - Investor bio/description

## Sample Data Row:
```
Name: "Sarah Chen"
Fund: "Paradigm"
Email: "sarah@paradigm.xyz"
Verified: ✓ (checked)
Twitter: "https://x.com/sarahchen"
X Profile: "https://x.com/sarahchen"
LinkedIn: "https://linkedin.com/in/sarahchen"
Telegram: "@sarahchen_paradigm"
Meeting/Calendly Link: "https://calendly.com/sarahchen"
Investment Stage: ["Seed", "Series A"]
Primary Sector: ["DeFi", "Infrastructure"]
Investment Thesis: "Focus on DeFi primitives and infrastructure that enables the next wave of decentralized finance adoption..."
Image: Upload professional headshot (JPEG format)
Price: 5
Limit: 10
Bio: "Partner at Paradigm focusing on DeFi infrastructure..."
```

## Personal Access Token Setup:
1. Go to https://airtable.com/create/tokens
2. Create new token with name "Ping Me Platform"
3. Add scopes:
   - data.records:read
   - schema.bases:read
4. Add your base access
5. Copy the token (starts with "pat...")

## Environment Variables:
- AIRTABLE_API_KEY = your personal access token
- AIRTABLE_BASE_ID = your base ID (starts with "app...")