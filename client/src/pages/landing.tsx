import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Lock, Calendar, MessageCircle, Mail } from "lucide-react";
import { FilterSection } from "@/components/filter-section";
import { VCCard } from "@/components/vc-card";
import { MarketplaceLanding } from "@/components/marketplace-landing";
import { ImprovedHeader } from "@/components/improved-header";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Landing() {
  const [stageFilter, setStageFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("");
  const [email, setEmail] = useState("");

  const { data: vcs = [], isLoading } = useQuery({
    queryKey: ["/api/vcs", { stage: stageFilter, sector: sectorFilter, verified: true }],
  });

  const { data: featuredProjects = [] } = useQuery({
    queryKey: ["/api/scout/featured"],
  });

  const handleScrollToVCs = () => {
    document.getElementById('vc-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <ImprovedHeader />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Where <span className="text-green-600">Founders</span> meet <span className="text-primary">VCs & Angels</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Pay once. Chat with the partner who writes the checks. No middlemen, no spam, pure signal.
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
            <p className="text-sm text-gray-500 mt-2">Get access to that alpha today</p>
          </div>
          
          
          
          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">1:1</div>
              <div className="text-sm text-gray-600">Warm Intro</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">Trusted</div>
              <div className="text-sm text-gray-600">No cold DMs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Pay-to-Ping</div>
            </div>
          </div>
        </div>
      </section>
      {/* Marketplace Section */}
      <MarketplaceLanding vcs={vcs.slice(0, 6)} projects={featuredProjects.slice(0, 6)} />
      {/* Filter Section */}
      <FilterSection 
        stageFilter={stageFilter}
        sectorFilter={sectorFilter}
        onStageChange={setStageFilter}
        onSectorChange={setSectorFilter}
      />
      {/* VC Grid */}
      <section className="py-16 bg-gray-50" id="vc-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connected VCs & Angels</h2>
            <p className="text-lg text-gray-600">Curated list of active VC's & Angel partners looking for quality dealflow</p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vcs.map((vc) => (
                <VCCard key={vc.id} vc={vc} isAuthenticated={false} />
              ))}
            </div>
          )}
          
          {!isLoading && vcs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No VCs found matching your filters.</p>
            </div>
          )}
        </div>
      </section>
      {/* VC Signup Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="vc-signup">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Join as a VC or Angel</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Curated dealflow without the noise. Get quality founder intros and earn from each connection.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Quality Founders</h3>
              <p className="text-sm text-gray-600">Only serious founders who pay to reach you</p>
            </Card>
            <Card className="p-6">
              <Badge className="w-8 h-8 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Earn Revenue</h3>
              <p className="text-sm text-gray-600">85% of each unlock fee goes to you</p>
            </Card>
            <Card className="p-6">
              <Lock className="w-8 h-8 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Stay In Control</h3>
              <p className="text-sm text-gray-600">Set your own pricing and intro limits</p>
            </Card>
          </div>
          
          <Button 
            size="lg"
            onClick={() => window.location.href = '/vc-signup'}
            className="bg-primary text-white px-8 py-4 text-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Apply to Join Ping Me
          </Button>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold">Ping Me</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">The fastest way for Web3 founders to connect with VCs & Angels. No middlemen, no spam, just warm intros that work.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Founders</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/ping" className="hover:text-white transition-colors">Ping</a></li>
                <li><a href="/how-it-works" className="hover:text-white transition-colors">Join as Founder</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For VCs & Angel</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/scout" className="hover:text-white transition-colors">Scout</a></li>
                <li><a href="/vc-signup" className="hover:text-white transition-colors">Join as VC or Angel</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Ping Me. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
                <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="/support" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
