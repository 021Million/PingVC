import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, Star, Shield, Globe, Linkedin, X, ExternalLink, Search } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ImprovedHeader } from "@/components/improved-header";

export default function VCs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  
  const { user, isAuthenticated } = useAuth();

  const { data: airtableData, isLoading: airtableLoading } = useQuery({
    queryKey: ["/api/airtable/vcs"],
  });

  // Filter Airtable VCs
  const filteredVerifiedVCs = (airtableData?.verifiedVCs || []).filter((vc: any) => {
    const matchesSearch = !searchTerm || 
      vc.fund?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === "All" || (vc.stages && vc.stages.includes(selectedStage));
    const matchesSector = selectedSector === "All" || (vc.specialties && vc.specialties.includes(selectedSector));
    
    return matchesSearch && matchesStage && matchesSector;
  });

  const stages = ["All", "Angel", "Pre-Seed", "Seed", "Series A", "Series B"];
  const sectors = ["All", "DeFi", "Stablecoins", "RWA", "Infrastructure", "Social", "Enterprise", "AI/ML", "Gaming"];

  const VCCard = ({ vc }: { vc: any }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <Link href={`/vc/${vc.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {vc.name ? vc.name.charAt(0) : 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                  {vc.name || 'Unknown VC'}
                </h3>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-gray-600 font-medium">{vc.fund || 'Unknown Fund'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {vc.stages && vc.stages.slice(0, 2).map((stage: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {stage}
                </Badge>
              ))}
              {vc.specialties && vc.specialties.slice(0, 2).map((sector: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {sector}
                </Badge>
              ))}
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 line-clamp-3">
              {vc.bio || vc.thesis || 'Investment focus and thesis information available after connection.'}
            </p>

            {/* Price */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-primary font-semibold">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-lg">{vc.price || '49'}</span>
                <span className="text-sm text-gray-500 ml-1">to connect</span>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Connect with verified investors
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse curated profiles, see pricing upfront, and get direct access to VCs and Angels.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search investors, funds, or focus areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Investment Stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* VC Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {airtableLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
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
          ) : filteredVerifiedVCs.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {filteredVerifiedVCs.length} verified investors found
                </h2>
                <p className="text-gray-600">
                  Connect directly with top-tier VCs and Angels. No cold outreach needed.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVerifiedVCs.map((vc: any, index: number) => (
                  <VCCard key={`verified-${index}`} vc={vc} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No investors found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStage("All");
                  setSelectedSector("All");
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}