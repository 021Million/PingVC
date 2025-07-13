import { db } from "../server/db";
import { vcs, users, founders } from "../shared/schema";
import { sql } from "drizzle-orm";

const seedData = async () => {
  try {
    console.log("Seeding database with test data...");

    // Clear existing test data
    await db.delete(vcs).where(sql`user_id LIKE 'test-%'`);
    await db.delete(founders).where(sql`user_id LIKE 'test-%'`);
    await db.delete(users).where(sql`id LIKE 'test-%'`);

    // Create test users for VCs
    const testUsers = await db.insert(users).values([
      {
        id: "test-vc-1",
        email: "sarah@a16z.com",
        firstName: "Sarah",
        lastName: "Chen",
        userType: "vc",
        profileCompleted: true,
      },
      {
        id: "test-vc-2", 
        email: "mike@sequoia.com",
        firstName: "Mike",
        lastName: "Johnson",
        userType: "vc",
        profileCompleted: true,
      },
      {
        id: "test-vc-3",
        email: "alex@paradigm.xyz",
        firstName: "Alex",
        lastName: "Thompson",
        userType: "vc", 
        profileCompleted: true,
      },
      {
        id: "test-vc-4",
        email: "emma@multicoin.capital",
        firstName: "Emma",
        lastName: "Wilson",
        userType: "vc",
        profileCompleted: true,
      },
      {
        id: "test-vc-5",
        email: "david@binance.labs",
        firstName: "David",
        lastName: "Rodriguez",
        userType: "vc",
        profileCompleted: true,
      },
      {
        id: "test-vc-6",
        email: "lisa@coinbase.ventures",
        firstName: "Lisa",
        lastName: "Kim",
        userType: "vc",
        profileCompleted: true,
      },
      // Test founders
      {
        id: "test-founder-1",
        email: "john@defiprotocol.com",
        firstName: "John",
        lastName: "Smith",
        userType: "founder",
        profileCompleted: true,
      },
      {
        id: "test-founder-2",
        email: "maria@stablecoinexchange.io",
        firstName: "Maria",
        lastName: "Garcia",
        userType: "founder",
        profileCompleted: true,
      },
      {
        id: "test-founder-3",
        email: "tom@rwatokenization.com",
        firstName: "Tom",
        lastName: "Lee",
        userType: "founder",
        profileCompleted: true,
      },
    ]).returning();

    // Create test VCs
    const testVCs = await db.insert(vcs).values([
      {
        userId: "test-vc-1",
        fundName: "Andreessen Horowitz",
        partnerName: "Sarah Chen",
        email: "sarah@a16z.com",
        stage: "Series A",
        sectors: ["DeFi", "Infrastructure", "Consumer"],
        investmentThesis: "We invest in crypto infrastructure that will power the next generation of decentralized applications. Focus on DeFi protocols, developer tools, and consumer applications with strong network effects.",
        contactType: "telegram",
        contactHandle: "@sarahchen_a16z",
        price: 149,
        isVerified: true,
        isActive: true,
        twitterUrl: "https://twitter.com/sarahchen_a16z",
        linkedinUrl: "https://linkedin.com/in/sarahchen",
      },
      {
        userId: "test-vc-2",
        fundName: "Sequoia Capital",
        partnerName: "Mike Johnson",
        email: "mike@sequoia.com",
        stage: "Seed",
        sectors: ["Infrastructure", "Developer Tools", "Enterprise"],
        investmentThesis: "Early-stage investments in crypto infrastructure and developer tools. We back exceptional founders building the picks and shovels for Web3 adoption.",
        contactType: "meeting",
        contactHandle: "https://calendly.com/mikejohnson-sequoia",
        price: 99,
        isVerified: true,
        isActive: true,
        linkedinUrl: "https://linkedin.com/in/mikejohnson",
        twitterUrl: "https://twitter.com/mikej_sequoia",
      },
      {
        userId: "test-vc-3",
        fundName: "Paradigm",
        partnerName: "Alex Thompson",
        email: "alex@paradigm.xyz",
        stage: "Series A",
        sectors: ["DeFi", "MEV", "Infrastructure"],
        investmentThesis: "Research-driven investments in crypto protocols with deep technical moats. We focus on DeFi primitives, MEV infrastructure, and blockchain scaling solutions.",
        contactType: "telegram",
        contactHandle: "@alexthompson_paradigm",
        price: 199,
        isVerified: true,
        isActive: true,
        linkedinUrl: "https://linkedin.com/in/alexthompson",
        twitterUrl: "https://twitter.com/alexthompson_p",
      },
      {
        userId: "test-vc-4",
        fundName: "Multicoin Capital",
        partnerName: "Emma Wilson",
        email: "emma@multicoin.capital",
        stage: "Series A",
        sectors: ["RWA", "Stablecoins", "Consumer"],
        investmentThesis: "Thesis-driven investments in Web3 consumer applications. We believe in the future of digital ownership, play-to-earn gaming, and creator economies.",
        contactType: "meeting",
        contactHandle: "https://calendly.com/emmawilson-multicoin",
        price: 129,
        isVerified: true,
        isActive: true,
        linkedinUrl: "https://linkedin.com/in/emmawilson",
        twitterUrl: "https://twitter.com/emmaw_multicoin",
      },
      {
        userId: "test-vc-5",
        fundName: "Binance Labs",
        partnerName: "David Rodriguez",
        email: "david@binance.labs",
        stage: "Seed",
        sectors: ["Infrastructure", "DeFi", "Trading"],
        investmentThesis: "Early-stage blockchain projects with strong technical teams and clear go-to-market strategies. Focus on infrastructure, trading tools, and DeFi protocols.",
        contactType: "telegram",
        contactHandle: "@davidrodriguez_binance",
        price: 79,
        isVerified: true,
        isActive: true,
        linkedinUrl: "https://linkedin.com/in/davidrodriguez",
        twitterUrl: "https://twitter.com/davidr_binance",
      },
      {
        userId: "test-vc-6",
        fundName: "Coinbase Ventures",
        partnerName: "Lisa Kim",
        email: "lisa@coinbase.ventures",
        stage: "Series A",
        sectors: ["Fintech", "Infrastructure", "Regulatory"],
        investmentThesis: "Strategic investments in crypto infrastructure and fintech that align with Coinbase's mission to increase economic freedom. Focus on regulatory-compliant solutions.",
        contactType: "meeting",
        contactHandle: "https://calendly.com/lisakim-coinbase",
        price: 119,
        isVerified: true,
        isActive: true,
        linkedinUrl: "https://linkedin.com/in/lisakim",
        twitterUrl: "https://twitter.com/lisakim_cb",
      },
    ]).returning();

    // Create test founder projects
    const testFounders = await db.insert(founders).values([
      {
        userId: "test-founder-1",
        companyName: "DeFi Protocol",
        description: "Revolutionary DeFi lending protocol with automated yield optimization. We're building the next generation of decentralized finance infrastructure.",
        pitchDeckUrl: "https://drive.google.com/file/d/1234567890/view",
        amountRaising: 2000000,
        traction: "• 10M+ TVL in beta\n• 5,000 active users\n• $200k monthly revenue\n• Partnership with 3 major DEXs",
        ecosystem: "ethereum",
        vertical: "defi",
        websiteUrl: "https://defiprotocol.com",
        githubUrl: "https://github.com/defiprotocol",
        isVisible: true,
        isFeatured: true,
        upvotes: 47,
        votes: 52,
      },
      {
        userId: "test-founder-2",
        companyName: "Stablecoin Exchange Pro",
        description: "Next-gen stablecoin exchange with advanced liquidity, social features, and creator monetization tools. Building the future of stable digital assets.",
        pitchDeckUrl: "https://drive.google.com/file/d/0987654321/view",
        amountRaising: 1500000,
        traction: "• 50k+ registered users\n• 15M+ stablecoins traded monthly\n• $100M+ in transaction volume\n• 50+ verified institutions",
        ecosystem: "polygon",
        vertical: "stablecoins",
        websiteUrl: "https://stablecoinexchangepro.io",
        githubUrl: "https://github.com/stablecoinexchangepro",
        isVisible: true,
        isFeatured: true,
        upvotes: 34,
        votes: 41,
      },
      {
        userId: "test-founder-3",
        companyName: "RWA Tokenization Hub",
        description: "Real-world asset tokenization platform with integrated DeFi protocols and institutional access. Creating sustainable tokenized asset economies for institutional users.",
        pitchDeckUrl: "https://drive.google.com/file/d/1122334455/view",
        amountRaising: 3000000,
        traction: "• 25k+ daily active users\n• 100M+ assets tokenized monthly\n• $500M in tokenized assets\n• 50+ institutional partners",
        ecosystem: "solana",
        vertical: "rwa",
        websiteUrl: "https://rwatokenizationhub.com",
        githubUrl: "https://github.com/rwatokenizationhub",
        isVisible: true,
        isFeatured: true,
        upvotes: 62,
        votes: 71,
      },
    ]).returning();

    console.log(`✅ Successfully seeded database with:`);
    console.log(`   - ${testUsers.length} test users`);
    console.log(`   - ${testVCs.length} test VCs`);
    console.log(`   - ${testFounders.length} test founder projects`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

// Run the seed function
seedData().then(() => process.exit(0));