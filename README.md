
# Ping VC - VC Contact Marketplace

A cutting-edge Web3-powered venture capital marketplace that intelligently connects startup founders with investors through advanced networking and secure blockchain interactions.

## 🚀 Overview

Ping VC is a unified VC discovery and booking platform for Web3 startups featuring:
- **Verified VCs** offering direct Stripe booking
- **Unverified VCs** allowing introduction requests via Airtable
- **Role-based signup flow** for VCs, Angels, and Founders
- **Project marketplace** for founders to showcase their startups
- **Gamification** with Top 3 VC leaderboard based on request popularity

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Shadcn/UI** components built on Radix UI primitives
- **Tailwind CSS** with CSS variables for theming
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** with Drizzle ORM
- **Neon** serverless PostgreSQL
- **Replit Auth** with OpenID Connect
- **Express sessions** with PostgreSQL store

### Integrations
- **Stripe** for payment processing
- **OpenAI** for AI-powered intro templates
- **Airtable** for VC signup tracking and booking requests
- **Beehiiv** for newsletter subscription management

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/021Million/PingVC.git
   cd PingVC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   DATABASE_URL=your_neon_postgresql_url
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   OPENAI_API_KEY=your_openai_api_key
   BEEHIIV_API_KEY=your_beehiiv_api_key
   AIRTABLE_API_KEY=your_airtable_api_key
   AIRTABLE_BASE_ID=your_airtable_base_id
   SESSION_SECRET=your_session_secret
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 Project Structure

```
PingVC/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── hooks/       # Custom React hooks
├── server/           # Express backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── auth.ts          # Authentication logic
├── shared/           # Shared types and schemas
│   └── schema.ts        # Drizzle database schema
└── uploads/          # File upload storage
```

## 🎯 Key Features

### For Founders
- Browse verified and unverified VCs
- Pay to unlock direct contact information
- Submit projects to marketplace
- Track connection requests and booking history

### For VCs & Angels
- Create investor profiles with custom pricing
- Receive quality founder introductions
- Track requests and bookings
- Earn revenue from connections (85% share)

### For Admins
- Verify VC applications
- Manage platform content
- Track analytics and metrics

## 🔒 Authentication

The platform supports dual authentication:
- **Email/Password** for direct registration
- **Replit Auth** for seamless integration

## 💳 Payment Integration

- **Stripe** integration for secure payment processing
- **Custom pricing** per VC (not fixed rates)
- **Revenue sharing** with 85% going to VCs
- **Charity donation** option for VCs

## 🚀 Deployment

The application is designed for single-server deployment:
- Frontend built to static assets via Vite
- Backend bundled via esbuild for Node.js
- Database schema managed through Drizzle migrations

### Build Commands
```bash
npm run build    # Production build
npm run start    # Start production server
npm run dev      # Development mode
```

## 📖 Documentation

- [Airtable Setup Guide](./airtable_setup_guide.md)
- [Project Architecture](./replit.md)
- [API Documentation](./docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Replit](https://replit.com) for rapid development
- UI components powered by [Shadcn/UI](https://ui.shadcn.com)
- Database hosting by [Neon](https://neon.tech)
- Payment processing by [Stripe](https://stripe.com)

---

**Connect with founders. Scale your dealflow. Power Web3.**

# PingVC
Where Founders meet VCs &amp; Angels

