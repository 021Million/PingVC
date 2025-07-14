# Airtable Booking Requests Table Setup

## New Table Required: "Booking Requests"

You need to create a new table in your Airtable base to track booking requests for unverified investors.

### Table Name: "Booking Requests"

### Required Fields:
- **VC Name** (Single line text) - Name of the VC being requested
- **VC Fund** (Single line text) - Fund name of the VC
- **VC Email** (Email) - VC's email address (if available)
- **VC ID** (Single line text) - Airtable record ID for the VC
- **Founder Email** (Email) - Email of founder making the request
- **Founder Name** (Single line text) - Name of founder making the request
- **Message** (Long text) - Introduction message from founder (optional)
- **Request Date** (Date) - When the request was made
- **Status** (Single select) - Options: "Pending", "Contacted", "Connected", "Declined"

### How to Set Up:
1. Go to your Airtable base
2. Click the "+" button next to your existing tables
3. Create a new table called "Booking Requests"
4. Add all the fields listed above with the specified field types
5. Set the Status field options: Pending, Contacted, Connected, Declined

### What This Does:
- When founders click "Request Introduction" on unverified VCs, their request gets saved to this table
- You can see all requests in one place with founder details and messages
- You can update the status as you reach out to VCs
- This data helps you cold DM investors to join the platform
- You can track which investors are most requested to prioritize verification

### Sample Data:
Once set up, requests will look like:
```
VC Name: John Smith
VC Fund: Crypto Ventures
VC Email: john@cryptoventures.com
VC ID: recABC123
Founder Email: founder@startup.com
Founder Name: Jane Doe
Message: "We're building a DeFi lending protocol..."
Request Date: 2025-07-14
Status: Pending
```

This gives you actionable data to reach out to popular unverified investors and invite them to join as verified members!