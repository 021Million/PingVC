import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Users, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EmailGate } from "@/components/email-gate";
import { ImprovedHeader } from "@/components/improved-header";
import { VCGridCard } from "@/components/vc-grid-card";

export default function VCs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [hasEmailAccess, setHasEmailAccess] = useState(false);
  
  // Check if user already has email access
  useEffect(() => {
    const storedEmail = localStorage.getItem('email_access_ping');
    if (storedEmail) {
      setHasEmailAccess(true);
    }
  }, []);

  const { data: airtableData, isLoading: airtableLoading } = useQuery({
    queryKey: ["/api/airtable/vcs"],
    enabled: hasEmailAccess,
  });

  const { data: vcs = [], isLoading: vcsLoading } = useQuery({
    queryKey: ["/api/vcs"],
    enabled: hasEmailAccess,
  });

  // Show email gate if user doesn't have access
  if (!hasEmailAccess) {
    return (
      <EmailGate
        title="Book Verified VCs for Your Startup"
        description="Get instant access to verified VC profiles and book meetings with top-tier investors. No spam, no DMs - just real conversations."
        source="vcs"
        onSuccess={() => setHasEmailAccess(true)}
      />
    );
  }

  // Filter logic
  const filteredVerifiedVCs = (airtableData?.verifiedVCs || []).filter((vc: any) => {
    const matchesSearch = !searchTerm || 
      vc.fund?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === "All" || 
      (vc['Investment Stage'] && (
        Array.isArray(vc['Investment Stage']) 
          ? vc['Investment Stage'].includes(selectedStage)
          : vc['Investment Stage'] === selectedStage
      ));
    
    const matchesSector = selectedSector === "All" || 
      (vc['Primary Sector'] && (
        Array.isArray(vc['Primary Sector']) 
          ? vc['Primary Sector'].includes(selectedSector)
          : vc['Primary Sector'] === selectedSector
      ));
    
    return matchesSearch && matchesStage && matchesSector;
  });

  const filteredPlatformVCs = vcs.filter((vc: any) => {
    const matchesSearch = !searchTerm || 
      vc.fundName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.partnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.investmentThesis?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === "All" || vc.stage === selectedStage;
    const matchesSector = selectedSector === "All" || vc.sectors?.includes(selectedSector);
    
    return matchesSearch && matchesStage && matchesSector && vc.isVerified;
  });

  const stages = ["All", "Angel", "Pre-Seed", "Seed", "Series A", "Series B"];
  const sectors = ["All", "DeFi", "Stablecoins", "RWA", "Infrastructure", "Social", "Enterprise", "AI/ML", "AI", "Infra"];

  const isLoading = airtableLoading || vcsLoading;
  const totalVCs = filteredVerifiedVCs.length + filteredPlatformVCs.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Verified VCs for Your Startup
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Skip the cold emails. Pay once, book a real conversation with top-tier investors.
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center">
                <Users className="h-6 w-6 mr-2" />
                <span>{totalVCs}+ Verified VCs</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 mr-2" />
                <span>Real Conversations</span>
              </div>
              <div className="flex items-center">
                <Star className="h-6 w-6 mr-2" />
                <span>No Spam Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search VCs, funds, or investment thesis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Investment Stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger>
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center mt-4 text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            <span>
              Showing {totalVCs} verified investors
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedStage !== "All" && ` in ${selectedStage}`}
              {selectedSector !== "All" && ` focused on ${selectedSector}`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VC Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Verified VCs */}
            {filteredVerifiedVCs.map((vc: any) => (
              <VCGridCard key={vc.id} vc={vc} type="verified" />
            ))}
            
            {/* Platform VCs */}
            {filteredPlatformVCs.map((vc: any) => (
              <VCGridCard key={vc.id} vc={vc} type="platform" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && totalVCs === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No VCs Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find more investors.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedStage("All");
                setSelectedSector("All");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}