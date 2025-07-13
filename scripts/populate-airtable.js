import Airtable from 'airtable';

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const sampleInvestors = [
  {
    "Name": "Sarah Chen",
    "Fund": "Paradigm",
    "Email": "sarah@paradigm.xyz",
    "Verified": true,
    "Twitter": "https://x.com/sarahchen",
    "X Profile": "https://x.com/sarahchen", 
    "LinkedIn": "https://linkedin.com/in/sarahchen-paradigm",
    "Telegram": "@sarahchen_paradigm",
    "Meeting/Calendly Link": "https://calendly.com/sarahchen-paradigm",
    "Investment Stage": ["Seed", "Series A"],
    "Primary Sector": ["DeFi", "Infrastructure"],
    "Investment Thesis": "Focus on DeFi primitives and infrastructure that enables the next wave of decentralized finance adoption. Looking for teams building the foundational layers of Web3.",
    "Image URL": "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
    "Specialties": ["DeFi", "Infrastructure"],
    "Price": 5,
    "Limit": 10,
    "Contact Link": "https://calendly.com/sarahchen-paradigm",
    "Bio": "Partner at Paradigm focusing on DeFi infrastructure and primitives. Previously built products at Coinbase and advised early DeFi protocols."
  },
  {
    "Name": "Marcus Rodriguez",
    "Fund": "a16z crypto",
    "Email": "marcus@a16zcrypto.com",
    "Verified": true,
    "Twitter": "https://x.com/marcusa16z",
    "X Profile": "https://x.com/marcusa16z",
    "LinkedIn": "https://linkedin.com/in/marcus-rodriguez-a16z",
    "Telegram": "@marcus_a16z",
    "Meeting/Calendly Link": "https://calendly.com/marcus-a16z",
    "Investment Stage": ["Series A", "Series B"],
    "Primary Sector": ["AI", "Consumer"],
    "Investment Thesis": "Investing in AI-powered consumer applications and infrastructure that will onboard the next billion users to crypto. Focus on product-market fit and user experience.",
    "Image URL": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "Specialties": ["AI", "Consumer"],
    "Price": 7,
    "Limit": 8,
    "Contact Link": "https://calendly.com/marcus-a16z",
    "Bio": "General Partner at a16z crypto leading consumer and AI investments. Former founder of two successful startups, passionate about user-centric Web3 products."
  },
  {
    "Name": "Elena Vasquez",
    "Fund": "Coinbase Ventures",
    "Email": "elena@coinbase.com",
    "Verified": true,
    "Twitter": "https://x.com/elenavasquez",
    "X Profile": "https://x.com/elenavasquez",
    "LinkedIn": "https://linkedin.com/in/elena-vasquez-cb",
    "Telegram": "@elena_cbv",
    "Meeting/Calendly Link": "https://calendly.com/elena-coinbase",
    "Investment Stage": ["Pre-Seed", "Seed"],
    "Primary Sector": ["Stablecoins", "RWA"],
    "Investment Thesis": "Early-stage investments in real-world asset tokenization and next-generation stablecoin infrastructure. Looking for regulatory-compliant solutions with clear paths to adoption.",
    "Image URL": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    "Specialties": ["Stablecoins", "RWA"],
    "Price": 4,
    "Limit": 12,
    "Contact Link": "https://calendly.com/elena-coinbase",
    "Bio": "Investment Partner at Coinbase Ventures specializing in regulatory-compliant Web3 infrastructure. Former Goldman Sachs, expert in traditional finance integration."
  },
  {
    "Name": "James Kim",
    "Fund": "Variant Fund",
    "Email": "james@variant.fund",
    "Verified": true,
    "Twitter": "https://x.com/jamesvariant",
    "X Profile": "https://x.com/jamesvariant",
    "LinkedIn": "https://linkedin.com/in/james-kim-variant",
    "Telegram": "@james_variant",
    "Meeting/Calendly Link": "https://calendly.com/james-variant",
    "Investment Stage": ["Seed", "Series A"],
    "Primary Sector": ["Gaming", "Social"],
    "Investment Thesis": "Investing in crypto-native social networks and gaming platforms that leverage token incentives to bootstrap network effects and community engagement.",
    "Image URL": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "Specialties": ["Gaming", "Social"],
    "Price": 6,
    "Limit": 15,
    "Contact Link": "https://calendly.com/james-variant",
    "Bio": "Co-founder and General Partner at Variant Fund. Focus on ownership economies, social tokens, and crypto gaming. Previously at USV and built social gaming companies."
  },
  {
    "Name": "Priya Patel",
    "Fund": "Electric Capital",
    "Email": "priya@electriccapital.com",
    "Verified": true,
    "Twitter": "https://x.com/priyaelectric",
    "X Profile": "https://x.com/priyaelectric",
    "LinkedIn": "https://linkedin.com/in/priya-patel-electric",
    "Telegram": "@priya_electric",
    "Meeting/Calendly Link": "https://calendly.com/priya-electric",
    "Investment Stage": ["Pre-Seed", "Seed", "Series A"],
    "Primary Sector": ["Developer Tools", "Infrastructure"],
    "Investment Thesis": "Supporting developer tools and infrastructure that make Web3 development more accessible. Looking for teams solving real developer pain points with measurable adoption metrics.",
    "Image URL": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    "Specialties": ["Developer Tools", "Infrastructure"],
    "Price": 5,
    "Limit": 20,
    "Contact Link": "https://calendly.com/priya-electric",
    "Bio": "Partner at Electric Capital investing in developer infrastructure and tools. Former engineering leader at Google and Stripe. PhD in Computer Science from Stanford."
  },
  {
    "Name": "Alex Thompson",
    "Fund": "Angel Investor",
    "Email": "alex@alexthompson.xyz",
    "Verified": true,
    "Twitter": "https://x.com/alexthompson",
    "X Profile": "https://x.com/alexthompson",
    "LinkedIn": "https://linkedin.com/in/alex-thompson-angel",
    "Telegram": "@alex_angel",
    "Meeting/Calendly Link": "https://calendly.com/alex-thompson",
    "Investment Stage": ["Angel", "Pre-Seed"],
    "Primary Sector": ["Enterprise", "Privacy"],
    "Investment Thesis": "Angel investor focused on privacy-preserving enterprise solutions and zero-knowledge applications. Looking for technical founders with deep crypto expertise.",
    "Image URL": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    "Specialties": ["Enterprise", "Privacy"],
    "Price": 3,
    "Limit": 5,
    "Contact Link": "https://calendly.com/alex-thompson",
    "Bio": "Independent angel investor and advisor. Former CTO at privacy-focused startups. Early adopter of ZK technology with 10+ years in crypto."
  }
];

async function populateAirtable() {
  try {
    console.log('Populating Airtable with sample verified investors...');
    
    // Create records in batches of 10 (Airtable limit)
    const batchSize = 10;
    for (let i = 0; i < sampleInvestors.length; i += batchSize) {
      const batch = sampleInvestors.slice(i, i + batchSize);
      const records = batch.map(investor => ({
        fields: investor
      }));
      
      await base('VCs').create(records);
      console.log(`Created ${records.length} records`);
    }
    
    console.log(`Successfully populated Airtable with ${sampleInvestors.length} verified investors!`);
    console.log('You can now test the platform with real investor data.');
    
  } catch (error) {
    console.error('Error populating Airtable:', error);
    
    if (error.statusCode === 422) {
      console.log('\nThis might be due to:');
      console.log('1. Field names not matching exactly in your Airtable');
      console.log('2. Data type mismatches (e.g., text vs. multiple select)');
      console.log('3. Required fields missing');
      console.log('\nPlease check your Airtable table structure matches the setup guide.');
    }
  }
}

// Run the script
populateAirtable();