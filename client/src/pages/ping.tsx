import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, Star, Shield, Globe, Linkedin, X, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { EmailGate } from "@/components/email-gate";
import { ImprovedHeader } from "@/components/improved-header";

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

  const { data: airtableData, isLoading: airtableLoading } = useQuery({
    queryKey: ["/api/airtable/vcs"],
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

  // Filter Airtable VCs
  const filteredVerifiedVCs = (airtableData?.verifiedVCs || []).filter((vc: any) => {
    const matchesSearch = !searchTerm || 
      vc.fund?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === "All" || (vc.specialties && vc.specialties.includes(selectedSector));
    
    return matchesSearch && matchesSector;
  });

  const filteredUnverifiedVCs = (airtableData?.unverifiedVCs || []).filter((vc: any) => {
    const matchesSearch = !searchTerm || 
      vc.fund?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === "All" || (vc.specialties && vc.specialties.includes(selectedSector));
    
    return matchesSearch && matchesSector;
  });

  const stages = ["All", "Angel", "Pre-Seed", "Seed", "Series A", "Series B"];
  const sectors = ["All", "DeFi", "Stablecoins", "RWA", "Infrastructure", "Social", "Enterprise", "AI/ML", "AI", "Infra"];

  const AirtableVCCard = ({ vc }: { vc: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            {vc.imageUrl && (
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={vc.imageUrl} 
                  alt={`${vc.name} photo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CardTitle className="text-lg">{vc.fund}</CardTitle>
                {vc.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{vc.name}</p>
              {vc.bio && (
                <p className="text-sm text-gray-700 line-clamp-2">{vc.bio}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-bold text-lg">${vc.price || 200}</span>
            </div>
            <p className="text-xs text-gray-500">per intro</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vc.specialties && vc.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {vc.specialties.map((specialty: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {vc.twitter && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={vc.twitter} target="_blank" rel="noopener noreferrer">
                    <X className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {vc.linkedin && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={vc.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            
            {vc.contactLink && (
              <Button size="sm" asChild>
                <a href={vc.contactLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                    <X className="h-4 w-4" />
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
      <ImprovedHeader />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connected VCs & Angels
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Connect with top-tier venture capitalists who are actively investing in Web3 and blockchain projects. All VCs & Angels are manually verified.</p>
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
            {isLoading ? "Loading..." : `${filteredVCs.length} Verified VCs & Angels`}
          </h2>
          <p className="text-gray-600">All VCs & Angels are manually verified and actively reviewing projects</p>
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
          <>
            {/* Verified Investors Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Verified Investors</h2>
                <Badge variant="secondary" className="ml-3 bg-green-100 text-green-800">
                  {filteredVerifiedVCs.length} Available
                </Badge>
              </div>
              
              {airtableLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredVerifiedVCs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVerifiedVCs.map((vc) => (
                    <AirtableVCCard key={vc.id} vc={vc} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No verified investors found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Community Curated VCs Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Community VCs</h2>
                <Badge variant="outline" className="ml-3">
                  {filteredUnverifiedVCs.length} Available
                </Badge>
              </div>
              
              {airtableLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredUnverifiedVCs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUnverifiedVCs.map((vc) => (
                    <AirtableVCCard key={vc.id} vc={vc} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No community VCs found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Legacy Platform VCs Section (Optional) */}
            {filteredVCs.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <Star className="h-6 w-6 text-orange-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Platform VCs</h2>
                  <Badge variant="outline" className="ml-3">
                    {filteredVCs.length} Available
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVCs.map((vc: any) => (
                    <VCCard key={vc.id} vc={vc} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}