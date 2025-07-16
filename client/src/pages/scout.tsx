import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ExternalLink, Twitter, Linkedin, Globe, FileText } from "lucide-react";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ListProjectButton } from "@/components/list-project-button";

interface ScoutProject {
  id: string;
  fields: {
    'Company Name': string;
    'Description': string;
    'Project Stage': string;
    'Ticker Launched': string;
    'DEX Screener URL': string;
    'Amount Raising': number;
    'Valuation': number;
    'Ecosystem': string;
    'Vertical': string;
    'Twitter URL': string;
    'Founder Twitter URL': string;
    'LinkedIn URL': string;
    'Website URL': string;
    'Revenue Generating': string;
    'Logo URL': string;
    'Pitch Deck URL': string;
    'Data Room URL': string;
    'Traction': string;
    'Votes': number;
    'Created': string;
    'Verification Status'?: string; // "under_review", "verified", "rejected"
    'Verified At'?: string;
  };
}

export default function Scout() {
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>("all");
  const [selectedVertical, setSelectedVertical] = useState<string>("all");
  const { isAuthenticated, user } = useAuth();

  const { data: projects = [], isLoading } = useQuery<ScoutProject[]>({
    queryKey: ["/api/scout-projects"],
  });

  const ecosystems = [
    "Ethereum", "Solana", "Polygon", "Binance Smart Chain", "Avalanche", 
    "Cardano", "TON", "Sui", "Polkadot", "Cosmos", "Optimism", "Aptos", 
    "Hedera", "Base", "Stellar"
  ];

  const verticals = [
    "DeFi", "Infrastructure", "Supply Chain", "Payments", "Identity", 
    "DAO", "Healthcare", "Meme", "Energy", "Compute", "SocialFi", 
    "Data", "Education", "Privacy", "Stablecoins", "RWA"
  ];

  const filteredProjects = projects.filter(project => {
    if (!project.fields) return false;
    const ecosystemMatch = selectedEcosystem === "all" || project.fields.Ecosystem === selectedEcosystem;
    const verticalMatch = selectedVertical === "all" || project.fields.Vertical === selectedVertical;
    return ecosystemMatch && verticalMatch;
  });

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Scout Marketplace</h1>
            <p className="text-xl text-gray-600 max-w-3xl">Discover top Web3 startups before the crowd.
            Back the next generation of breakthrough founders.</p>
            {/* List Project Button - always show, let the component handle the logic */}
            <div className="mt-6 mb-4">
              <ListProjectButton variant="large" className="shadow-lg bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold" />
              <p className="text-sm text-gray-500 mt-3">
                {!isAuthenticated ? "Sign in as a founder to list your project" : "Share your project with investors and the community"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ecosystem
              </label>
              <select
                value={selectedEcosystem}
                onChange={(e) => setSelectedEcosystem(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Ecosystems</option>
                {ecosystems.map(ecosystem => (
                  <option key={ecosystem} value={ecosystem}>{ecosystem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vertical
              </label>
              <select
                value={selectedVertical}
                onChange={(e) => setSelectedVertical(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Verticals</option>
                {verticals.map(vertical => (
                  <option key={vertical} value={vertical}>{vertical}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              if (!project.fields) return null;
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {project.fields['Logo URL'] && (
                          <img 
                            src={project.fields['Logo URL']} 
                            alt={`${project.fields['Company Name']} logo`}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{project.fields['Company Name'] || 'Unnamed Project'}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{project.fields.Ecosystem || 'N/A'}</Badge>
                            <Badge variant="outline">{project.fields.Vertical || 'N/A'}</Badge>
                            {/* Verification Status Badge */}
                            {project.fields['Verification Status'] === 'verified' ? (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                ✓ Verified
                              </Badge>
                            ) : project.fields['Verification Status'] === 'rejected' ? (
                              <Badge variant="destructive">
                                ✕ Rejected
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-orange-300 text-orange-600">
                                ⏳ Under Review
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-green-600">
                          <ArrowUp className="h-4 w-4" />
                          <span className="font-semibold">{project.fields.Votes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {project.fields.Description || 'No description available'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Stage:</span>
                        <Badge variant="outline">{project.fields['Project Stage'] || 'N/A'}</Badge>
                      </div>

                      {project.fields['Amount Raising'] ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Raising:</span>
                          <span className="font-semibold">{formatAmount(project.fields['Amount Raising'])}</span>
                        </div>
                      ) : null}

                      {project.fields.Valuation ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Valuation:</span>
                          <span className="font-semibold">{formatAmount(project.fields.Valuation)}</span>
                        </div>
                      ) : null}

                      {project.fields['Revenue Generating'] && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Revenue:</span>
                          <Badge variant={project.fields['Revenue Generating'] === 'Yes' ? 'default' : 'secondary'}>
                            {project.fields['Revenue Generating']}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {!project.fields['Amount Raising'] && !project.fields.Valuation && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-blue-800 text-sm font-medium">Please get in contact with founder</p>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex space-x-2 mb-4">
                      {project.fields['Twitter URL'] && (
                        <a 
                          href={project.fields['Twitter URL']} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {project.fields['LinkedIn URL'] && (
                        <a 
                          href={project.fields['LinkedIn URL']} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {project.fields['Website URL'] && (
                        <a 
                          href={project.fields['Website URL']} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      {project.fields['Founder Twitter URL'] && (
                        <a 
                          href={project.fields['Founder Twitter URL']} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-500 hover:text-purple-700"
                          title="Founder Twitter"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        Upvote
                      </Button>
                      {project.fields['Pitch Deck URL'] && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                        >
                          <a href={project.fields['Pitch Deck URL']} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found matching your filters.</p>
            <p className="text-gray-400 mt-2">Try adjusting your ecosystem or vertical selection.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mt-12 text-center">
          {user?.userType === 'vc' || user?.userType === 'angel' ? (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to connect with founders?</h3>
              <p className="text-gray-600 mb-6">Browse our verified investor network and connect with high-quality Web3 startups.</p>
              <Button asChild size="lg">
                <Link href="/vcs">
                  Browse Investors
                </Link>
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to showcase your project?</h3>
              <p className="text-gray-600 mb-6">Join the Marketplace and get discovered by investors and the Web3 community.</p>
              <ListProjectButton variant="large" />
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <ListProjectButton variant="floating" />
      </div>
    </div>
  );
}