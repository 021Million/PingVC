import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImprovedHeader } from '@/components/improved-header';
import { Search, Globe, Filter, Target, Users, Star, ArrowUpRight, Twitter, Check, Send, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface UnifiedVC {
  id: string;
  name: string;
  title?: string;
  fund: string;
  bio?: string;
  tags?: string[];
  'Investment Stage'?: string[];
  'Primary Sector'?: string[];
  'Investment Thesis'?: string;
  price?: number;
  twitter?: string;
  'X Profile'?: string;
  linkedin?: string;
  website?: string;
  Image?: Array<{ url: string }>;
  verified: boolean;
  viewCount?: number;
  bookingCount?: number;
}

export default function BrowseVCs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const { toast } = useToast();

  // Fetch all VCs (verified and unverified)
  const { data: vcsData, isLoading } = useQuery({
    queryKey: ['/api/browse-vcs'],
  });

  const requestCallMutation = useMutation({
    mutationFn: async ({ vcId, founderEmail }: { vcId: string; founderEmail: string }) => {
      const res = await apiRequest('POST', '/api/request-call', { vcId, founderEmail });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: "Our team will notify the investor about your interest.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const allVCs = useMemo(() => {
    if (!vcsData) return [];
    return [...(vcsData.verifiedVCs || []), ...(vcsData.unverifiedVCs || [])].map((vc: any) => ({
      ...vc,
      verified: vcsData.verifiedVCs?.includes(vc) || false
    }));
  }, [vcsData]);

  const filteredVCs = useMemo(() => {
    return allVCs.filter((vc: UnifiedVC) => {
      const matchesSearch = !searchTerm || 
        vc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vc.fund?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vc.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vc['Primary Sector']?.some(sector => sector.toLowerCase().includes(searchTerm.toLowerCase())) ||
        vc['Investment Stage']?.some(stage => stage.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStage = !stageFilter || 
        vc['Investment Stage']?.includes(stageFilter);

      const matchesSector = !sectorFilter || 
        vc['Primary Sector']?.includes(sectorFilter);

      const matchesVerified = !verifiedFilter || 
        (verifiedFilter === 'verified' && vc.verified) ||
        (verifiedFilter === 'unverified' && !vc.verified);

      return matchesSearch && matchesStage && matchesSector && matchesVerified;
    });
  }, [allVCs, searchTerm, stageFilter, sectorFilter, verifiedFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStageFilter('');
    setSectorFilter('');
    setVerifiedFilter('');
  };

  const handleBookCall = async (vc: UnifiedVC) => {
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        vcId: vc.id,
        amount: vc.price || 3000, // Default price if not set
      });
      const data = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestCall = (vc: UnifiedVC) => {
    const founderEmail = prompt("Enter your email to request a call:");
    if (founderEmail && founderEmail.includes('@')) {
      requestCallMutation.mutate({ vcId: vc.id, founderEmail });
    } else if (founderEmail) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  const getStageDisplay = (stages: string[] | undefined) => {
    if (!stages || stages.length === 0) return 'Not specified';
    return stages.join(', ');
  };

  const getSectorDisplay = (sectors: string[] | undefined) => {
    if (!sectors || sectors.length === 0) return 'Web3';
    return sectors.slice(0, 3).join(', ') + (sectors.length > 3 ? ` +${sectors.length - 3}` : '');
  };

  const getTwitterUrl = (vc: UnifiedVC) => {
    const twitterUrl = vc.twitter || vc['X Profile'];
    if (!twitterUrl) return null;
    
    if (twitterUrl.startsWith('http')) {
      return twitterUrl;
    }
    
    const handle = twitterUrl.replace('@', '');
    return `https://twitter.com/${handle}`;
  };

  const getWebsiteUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return '$3,000'; // Default price
    return `$${price.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading investors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-primary mr-3" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                Discovery + Booking
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Browse All Investors
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover verified VCs you can book directly, plus community-curated investors.<br />
              Connect with the right investors for your stage and sector.
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {allVCs.length}+ Investors
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                {allVCs.filter(vc => vc.verified).length} Verified
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Community Curated
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search investors, funds, or focus areas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>
                
                <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Community Curated</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Angel">Angel</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DeFi">DeFi</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="NFTs">NFTs</SelectItem>
                    <SelectItem value="Consumer">Consumer</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="Payments">Payments</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || stageFilter || sectorFilter || verifiedFilter) && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredVCs.length} of {allVCs.length} investors
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VCs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredVCs.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVCs.map((vc: UnifiedVC) => (
              <Card key={vc.id} className="hover:shadow-md transition-shadow duration-200 group">
                <CardContent className="p-6">
                  {/* VC Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {vc.Image && vc.Image[0] ? (
                        <img
                          src={vc.Image[0].url}
                          alt={vc.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center border-2 border-gray-100">
                          <span className="text-white font-semibold text-lg">
                            {vc.name ? vc.name.substring(0, 2).toUpperCase() : 'VC'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {vc.name}
                          </h3>
                          {vc.fund && (
                            <p className="text-sm text-gray-600 mt-1">{vc.fund}</p>
                          )}
                        </div>
                        {vc.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price (for verified VCs) */}
                  {vc.verified && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(vc.price)}
                        </span>
                        <span className="text-sm text-gray-500">per intro call</span>
                      </div>
                    </div>
                  )}

                  {/* Focus and Stage */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Focus</p>
                      <p className="text-sm text-gray-600">{getSectorDisplay(vc['Primary Sector'])}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Stage</p>
                      <p className="text-sm text-gray-600">{getStageDisplay(vc['Investment Stage'])}</p>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {vc.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {vc.bio.length > 100 ? `${vc.bio.substring(0, 100)}...` : vc.bio}
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="flex items-center space-x-3 mb-4 pt-3 border-t border-gray-100">
                    {getTwitterUrl(vc) && (
                      <a
                        href={getTwitterUrl(vc)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                        <span className="text-xs">Twitter</span>
                      </a>
                    )}
                    
                    {vc.website && (
                      <a
                        href={getWebsiteUrl(vc.website)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-xs">Website</span>
                      </a>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="space-y-2">
                    {vc.verified ? (
                      <Button 
                        onClick={() => handleBookCall(vc)}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Call
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleRequestCall(vc)}
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                        disabled={requestCallMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {requestCallMutation.isPending ? 'Sending...' : 'Request Call'}
                      </Button>
                    )}
                  </div>

                  {/* Verification Note */}
                  {!vc.verified && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Our team will reach out to this investor on your behalf
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}