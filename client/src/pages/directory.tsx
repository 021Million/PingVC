import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImprovedHeader } from '@/components/improved-header';
import { Search, ExternalLink, Globe, Filter, TrendingUp, Target, Users, Star, ArrowUpRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Twitter } from 'lucide-react';

interface AirtableVC {
  id: string;
  name: string;
  title: string;
  fund: string;
  bio?: string;
  'Investment Stage'?: string[];
  'Primary Sector'?: string[];
  'Investment Thesis'?: string;
  twitter?: string;
  'X Profile'?: string;
  linkedin?: string;
  website?: string;
  Image?: Array<{ url: string }>;
  verified?: boolean;
}

export default function Directory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');

  const { data: vcsData, isLoading } = useQuery({
    queryKey: ['/api/airtable/vcs'],
  });

  const allVCs = useMemo(() => {
    if (!vcsData) return [];
    return [...(vcsData.verifiedVCs || []), ...(vcsData.unverifiedVCs || [])];
  }, [vcsData]);

  const filteredVCs = useMemo(() => {
    return allVCs.filter((vc: AirtableVC) => {
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

      return matchesSearch && matchesStage && matchesSector;
    });
  }, [allVCs, searchTerm, stageFilter, sectorFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStageFilter('');
    setSectorFilter('');
  };

  const getStageDisplay = (stages: string[] | undefined) => {
    if (!stages || stages.length === 0) return 'Not specified';
    return stages.join(', ');
  };

  const getSectorDisplay = (sectors: string[] | undefined) => {
    if (!sectors || sectors.length === 0) return 'Web3';
    return sectors.slice(0, 3).join(', ') + (sectors.length > 3 ? ` +${sectors.length - 3}` : '');
  };

  const getTwitterUrl = (vc: AirtableVC) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading the ultimate Web3 VC directory...</p>
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
              <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                100% Free • No Login Required
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Ultimate Web3 VC Directory for Founders
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Save hours of crawling Twitter and LinkedIn.<br />
              Browse verified Web3 VCs in one place — no logins, no noise, just signal.
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {allVCs.length}+ VCs Listed
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Active 2024
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Community Curated
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search by name, fund, or focus area..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>
                
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Investment Stage" />
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
                    <SelectValue placeholder="Focus Area" />
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

              {(searchTerm || stageFilter || sectorFilter) && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredVCs.length} of {allVCs.length} VCs
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

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredVCs.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No VCs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVCs.map((vc: AirtableVC) => (
              <Card key={vc.id} className="hover:shadow-md transition-shadow duration-200 group">
                <CardContent className="p-6">
                  {/* VC Image and Name */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {vc.Image && vc.Image[0] ? (
                        <img
                          src={vc.Image[0].url}
                          alt={vc.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {vc.name ? vc.name.substring(0, 2).toUpperCase() : 'VC'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {vc.name}
                        </h3>
                        {vc.verified && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      {vc.fund && (
                        <p className="text-sm text-gray-600 mt-1">{vc.fund}</p>
                      )}
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Focus</p>
                    <p className="text-sm text-gray-600">{getSectorDisplay(vc['Primary Sector'])}</p>
                  </div>

                  {/* Investment Stage */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Stage</p>
                    <p className="text-sm text-gray-600">{getStageDisplay(vc['Investment Stage'])}</p>
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
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                    {getTwitterUrl(vc) && (
                      <a
                        href={getTwitterUrl(vc)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors group-hover:text-blue-600"
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
                        className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors group-hover:text-green-700"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-xs">Website</span>
                      </a>
                    )}

                    <div className="flex-1"></div>
                    
                    {/* Active Badge */}
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                      Active 2024
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-white rounded-xl border shadow-sm p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Need to connect directly with VCs?
          </h3>
          <p className="text-gray-600 mb-6">
            This directory shows public info. For direct contact and booking, check out our premium platform.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/vcs'}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Upgrade to unlock contact info
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:submit@pingme.com?subject=Submit VC to Directory'}
            >
              Submit a VC to directory
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}