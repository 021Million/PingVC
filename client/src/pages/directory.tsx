import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImprovedHeader } from '@/components/improved-header';
import { Search, ExternalLink, X, Linkedin, Globe, Filter, Users, TrendingUp, Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
        vc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vc.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage = !stageFilter || 
        (vc['Investment Stage'] && vc['Investment Stage'].includes(stageFilter));

      const matchesSector = !sectorFilter || 
        (vc['Primary Sector'] && vc['Primary Sector'].includes(sectorFilter));

      return matchesSearch && matchesStage && matchesSector;
    });
  }, [allVCs, searchTerm, stageFilter, sectorFilter]);

  const allStages = useMemo(() => {
    const stages = new Set<string>();
    allVCs.forEach((vc: AirtableVC) => {
      if (vc['Investment Stage']) {
        vc['Investment Stage'].forEach(stage => stages.add(stage));
      }
    });
    return Array.from(stages).sort();
  }, [allVCs]);

  const allSectors = useMemo(() => {
    const sectors = new Set<string>();
    allVCs.forEach((vc: AirtableVC) => {
      if (vc['Primary Sector']) {
        vc['Primary Sector'].forEach(sector => sectors.add(sector));
      }
    });
    return Array.from(sectors).sort();
  }, [allVCs]);

  const clearFilters = () => {
    setSearchTerm('');
    setStageFilter('');
    setSectorFilter('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Web3 VC Directory
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The complete free directory of Web3 venture capitalists, angels, and investors. 
            Find the right investor for your startup with comprehensive profiles and contact information.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {allVCs.length} Investors
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              {allSectors.length} Sectors
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {allStages.length} Stages
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, fund, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Stage Filter */}
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Investment Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Stages</SelectItem>
                  {allStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sector Filter */}
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Primary Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sectors</SelectItem>
                  {allSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchTerm || stageFilter || sectorFilter) && (
                <Button onClick={clearFilters} variant="outline" className="lg:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredVCs.length} of {allVCs.length} investors
          </p>
        </div>

        {/* VC Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVCs.map((vc: AirtableVC) => (
            <Card key={vc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {vc.Image && Array.isArray(vc.Image) && vc.Image.length > 0 ? (
                      <img 
                        src={vc.Image[0].url} 
                        alt={vc.name || "Investor"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-lg font-medium">
                          {(vc.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                          {vc.name || "Partner Name"}
                        </CardTitle>
                        <p className="text-sm text-gray-600 truncate">
                          {vc.title || "Position"}
                        </p>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {vc.fund || "Fund Name"}
                        </p>
                      </div>
                      {vc.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Investment Focus */}
                {(vc['Investment Stage'] || vc['Primary Sector']) && (
                  <div className="space-y-2">
                    {vc['Investment Stage'] && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Investment Stages</p>
                        <div className="flex flex-wrap gap-1">
                          {vc['Investment Stage'].slice(0, 2).map((stage, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {stage}
                            </Badge>
                          ))}
                          {vc['Investment Stage'].length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{vc['Investment Stage'].length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {vc['Primary Sector'] && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Primary Sectors</p>
                        <div className="flex flex-wrap gap-1">
                          {vc['Primary Sector'].slice(0, 2).map((sector, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {sector}
                            </Badge>
                          ))}
                          {vc['Primary Sector'].length > 2 && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              +{vc['Primary Sector'].length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio Preview */}
                {vc.bio && (
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {vc.bio.length > 100 ? `${vc.bio.substring(0, 100)}...` : vc.bio}
                    </p>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex space-x-3">
                    {(vc.twitter || vc['X Profile']) && (
                      <a 
                        href={vc.twitter || vc['X Profile']} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="X Profile"
                      >
                        <X className="h-4 w-4" />
                      </a>
                    )}
                    {vc.linkedin && (
                      <a 
                        href={vc.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {vc.website && (
                      <a 
                        href={vc.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title="Website"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/vc/${vc.id}`, '_blank')}
                    className="text-xs"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredVCs.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No investors found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more results.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Missing from our directory?
              </h3>
              <p className="text-blue-700 mb-4">
                We're constantly updating our database. If you know of a Web3 investor we should include, 
                let us know and we'll add them to the directory.
              </p>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Suggest an Investor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}