import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, Star, Shield, Globe, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { EmailGate } from "@/components/email-gate";

export default function Ping() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [hasEmailAccess, setHasEmailAccess] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  // Check if user already has email access on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('email_access_ping');
    if (storedEmail) {
      setHasEmailAccess(true);
    }
  }, []);

  const { data: vcs = [], isLoading } = useQuery({
    queryKey: ["/api/vcs", { stage: selectedStage, sector: selectedSector }],
    enabled: hasEmailAccess,
  });

  // Show email gate if user doesn't have access
  if (!hasEmailAccess) {
    return (
      <EmailGate
        title="Access Ping"
        description="To unlock instant access to our verified VC directory and connect with top-tier investors, please provide your email address. This helps us maintain a quality community of founders and investors."
        source="ping"
        onSuccess={() => setHasEmailAccess(true)}
      />
    );
  }

  const filteredVCs = vcs.filter(vc => {
    const matchesSearch = !searchTerm || 
      vc.fundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.investmentThesis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === "All" || vc.stage === selectedStage;
    const matchesSector = selectedSector === "All" || vc.sectors.includes(selectedSector);
    
    return matchesSearch && matchesStage && matchesSector && vc.isVerified;
  });

  const stages = ["All", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];
  const sectors = ["All", "DeFi", "Gaming", "NFTs", "Infrastructure", "Social", "Enterprise", "AI/ML", "RWA", "Stablecoins"];

  const VCCard = ({ vc }: { vc: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg">{vc.fundName}</CardTitle>
              {vc.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{vc.partnerName}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline">{vc.stage}</Badge>
              {vc.sectors.slice(0, 3).map((sector: string) => (
                <Badge key={sector} variant="secondary">{sector}</Badge>
              ))}
              {vc.sectors.length > 3 && (
                <Badge variant="secondary">+{vc.sectors.length - 3} more</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-green-600 font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>${(vc.price / 100).toFixed(0)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">per intro</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Investment Focus</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{vc.investmentThesis}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Up to {vc.weeklyIntroLimit} intros/week</span>
            </div>
            
            <div className="flex space-x-2">
              {vc.linkedinUrl && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={vc.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {vc.twitterUrl && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={vc.twitterUrl} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href={`/vc/${vc.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ping Me</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/scout" className="text-gray-600 hover:text-primary transition-colors">
                Scout
              </Link>
              {!isAuthenticated ? (
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  size="sm"
                  className="bg-primary text-white hover:bg-indigo-700"
                >
                  Sign In
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome back!</span>
                  <Button 
                    onClick={() => window.location.href = '/api/logout'}
                    variant="ghost"
                    size="sm"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Verified VCs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Connect with top-tier venture capitalists who are actively investing in web3 and blockchain projects. All VCs & Angels are manually verified.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search VCs
              </label>
              <Input
                placeholder="Search by fund name, partner, or focus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Stage
              </label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector Focus
              </label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoading ? "Loading..." : `${filteredVCs.length} Verified VCs`}
          </h2>
          <p className="text-gray-600">
            All VCs are manually verified and actively reviewing projects
          </p>
        </div>

        {/* VC Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVCs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No VCs found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVCs.map((vc: any) => (
              <VCCard key={vc.id} vc={vc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}