import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Users, TrendingUp, ArrowRight, Mail, Zap, Shield, Building2, Rocket } from "lucide-react";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [email, setEmail] = useState("");
  
  const { data: vcs = [] } = useQuery({
    queryKey: ["/api/vcs", { verified: true }],
  });

  const { data: featuredProjects = [] } = useQuery({
    queryKey: ["/api/scout/featured"],
  });

  // Sample data for demonstration
  const sampleVCs = [
    {
      id: 1,
      fundName: "Paradigm",
      partnerName: "Matt Huang",
      stage: "Series A-C",
      sector: "DeFi",
      price: 149,
      isVerified: true,
      description: "Leading crypto-native investment firm"
    },
    {
      id: 2,
      fundName: "a16z crypto",
      partnerName: "Chris Dixon",
      stage: "Seed-Series B",
      sector: "Infrastructure",
      price: 199,
      isVerified: true,
      description: "Building the future of web3"
    },
    {
      id: 3,
      fundName: "Coinbase Ventures",
      partnerName: "Alex Reeve",
      stage: "Seed-Series A",
      sector: "Consumer",
      price: 99,
      isVerified: true,
      description: "Investing in the cryptoeconomy"
    }
  ];

  const sampleFounders = [
    {
      id: 1,
      companyName: "ZeroSync",
      founderName: "Robin Linus",
      ecosystem: "Bitcoin",
      vertical: "Infrastructure",
      description: "Zero-knowledge proofs for Bitcoin scaling",
      votes: 128,
      amountRaising: 5000000
    },
    {
      id: 2,
      companyName: "Fhenix",
      founderName: "Guy Itzhaki",
      ecosystem: "Ethereum",
      vertical: "Privacy",
      description: "Fully Homomorphic Encryption for Ethereum",
      votes: 94,
      amountRaising: 8000000
    },
    {
      id: 3,
      companyName: "Morpho",
      founderName: "Paul Frambot",
      ecosystem: "Ethereum",
      vertical: "DeFi",
      description: "Optimized lending protocol infrastructure",
      votes: 156,
      amountRaising: 12000000
    }
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Store email and redirect to sign up
      localStorage.setItem('signup_email', email);
      window.location.href = '/api/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Where <span className="text-primary">Founders</span> Meet <span className="text-green-600">VCs</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The marketplace connecting web3 founders with verified venture capitalists. 
              Pay once, get warm introductions with customized AI-powered intro templates.
            </p>
            
            {/* Email Capture */}
            <div className="max-w-md mx-auto mb-8">
              <form onSubmit={handleEmailSubmit} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email to unlock browsing"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="bg-primary text-white px-6">
                  <Mail className="mr-2 h-4 w-4" />
                  Unlock
                </Button>
              </form>
              <p className="text-sm text-gray-500 mt-2">
                Instant access to 500+ verified VCs and trending projects
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-gray-600">Verified VCs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">$2B+</div>
                <div className="text-gray-600">Assets Under Management</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">95%</div>
                <div className="text-gray-600">Response Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Sample VCs Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Venture Capitalists</h2>
              <p className="text-lg text-gray-600">Connect with top-tier VCs actively investing in web3</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {sampleVCs.map((vc) => (
                <Card key={vc.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{vc.fundName}</CardTitle>
                        <p className="text-sm text-gray-600">{vc.partnerName}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {vc.stage}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {vc.sector}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {vc.description}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-semibold text-primary">
                          ${vc.price}
                        </span>
                        <Button size="sm" className="group-hover:bg-primary/90">
                          Connect <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/join">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  View All 500+ VCs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Sample Founders Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Startup Projects</h2>
              <p className="text-lg text-gray-600">Discover innovative founders building the future of web3</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {sampleFounders.map((founder) => (
                <Card key={founder.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{founder.companyName}</CardTitle>
                        <p className="text-sm text-gray-600">{founder.founderName}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">{founder.votes}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {founder.ecosystem}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {founder.vertical}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {founder.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        Raising: ${founder.amountRaising.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">Community favorite</span>
                        </div>
                        <Button size="sm" variant="outline" className="group-hover:border-green-500 group-hover:text-green-600">
                          <Rocket className="mr-1 h-3 w-3" />
                          View Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/scout">
                <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                  Explore Scout Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Ping Me Works</h2>
              <p className="text-lg text-gray-600">Three simple steps to connect with VCs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Browse & Filter</h3>
                <p className="text-gray-600">
                  Explore verified VCs by stage, sector, and investment focus. Each profile shows their track record and preferences.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Pay & Unlock</h3>
                <p className="text-gray-600">
                  Pay the VC's custom price to unlock their contact info and receive a customized AI-powered intro template.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Connect & Grow</h3>
                <p className="text-gray-600">
                  Use your personalized intro template to reach out. Enjoy a 95% response rate from engaged investors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Connect with Top VCs?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of founders who've raised funding through Ping Me
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  <Users className="mr-2 h-4 w-4" />
                  Get Started Now
                </Button>
              </Link>
              <Link href="/scout">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Feature Your Project
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}