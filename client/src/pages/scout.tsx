import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ExternalLink, Users, DollarSign, TrendingUp, Globe, Linkedin, X, Trophy, Award, Medal } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EmailGate } from "@/components/email-gate";
import { Header } from "@/components/header";

export default function Scout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEcosystem, setSelectedEcosystem] = useState("All");
  const [selectedVertical, setSelectedVertical] = useState("All");
  const [hasEmailAccess, setHasEmailAccess] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user already has email access on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('email_access_scout');
    if (storedEmail) {
      setHasEmailAccess(true);
    }
  }, []);

  // Fetch all projects and calculate top voted projects
  const { data: allProjects = [], isLoading: loadingAll } = useQuery({
    queryKey: ["/api/scout/projects", { ecosystem: selectedEcosystem, vertical: selectedVertical }],
    enabled: hasEmailAccess, // Only fetch when user has access
  });

  // Sort projects by vote count and separate top 3 from the rest
  const sortedProjects = [...allProjects].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
  const topProjects = sortedProjects.slice(0, 3);
  const remainingProjects = sortedProjects.slice(3);

  // Function to create animated rocket ship emojis
  const createRocketAnimation = () => {
    const rockets = ['🚀', '🚀', '🚀', '🚀', '🚀'];
    
    rockets.forEach((rocket, index) => {
      const rocketElement = document.createElement('div');
      rocketElement.textContent = rocket;
      rocketElement.style.cssText = `
        position: fixed;
        font-size: 2rem;
        z-index: 9999;
        pointer-events: none;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight}px;
        animation: rocketFly 2s ease-out forwards;
      `;
      
      // Add rocket animation keyframes if not already added
      if (!document.querySelector('#rocket-animation-style')) {
        const style = document.createElement('style');
        style.id = 'rocket-animation-style';
        style.textContent = `
          @keyframes rocketFly {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(-${window.innerHeight + 100}px) rotate(360deg);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(rocketElement);
      
      // Remove element after animation
      setTimeout(() => {
        rocketElement.remove();
      }, 2000);
    });
  };

  const voteMutation = useMutation({
    mutationFn: async ({ founderId, action }: { founderId: number; action: 'vote' | 'unvote' }) => {
      const email = localStorage.getItem('email_access_scout');
      await apiRequest("POST", `/api/scout/projects/${founderId}/${action}`, { email });
      return { action }; // Return the action so we can access it in onSuccess
    },
    onSuccess: (data) => {
      // Trigger rocket animation only when voting (not unvoting)
      if (data.action === 'vote') {
        createRocketAnimation();
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/scout/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scout/projects"] });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to update vote. Please try again.";
      if (errorMessage.includes("24 hours")) {
        toast({
          title: "Voting Limit Reached",
          description: "You can only vote once every 24 hours. Please try again tomorrow.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Show email gate if user doesn't have access
  if (!hasEmailAccess) {
    return (
      <EmailGate
        title="Access Scout"
        description="To unlock instant access to the Scout page and discover emerging Web3 projects, please provide your email address. This helps us maintain a quality community of founders and investors."
        source="scout"
        onSuccess={() => setHasEmailAccess(true)}
      />
    );
  }

  const handleVote = (founderId: number, hasVoted: boolean) => {
    const email = localStorage.getItem('email_access_scout');
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please provide your email to vote for projects",
        variant: "destructive",
      });
      return;
    }
    
    voteMutation.mutate({
      founderId,
      action: hasVoted ? 'unvote' : 'vote'
    });
  };

  const TopProjectCard = ({ project, rank }: { project: any; rank: number }) => {
    const rankIcons = [
      <Trophy className="h-6 w-6 text-yellow-500" />,
      <Medal className="h-6 w-6 text-gray-400" />,
      <Award className="h-6 w-6 text-amber-600" />
    ];
    
    const rankBadges = ["🥇 #1", "🥈 #2", "🥉 #3"];
    
    return (
      <Link href={`/project/${project.id}`}>
        <a className="block">
          <Card className="border-2 border-primary bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] relative overflow-hidden">
            {/* Trending badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-500 text-white font-bold">
                🔥 {rankBadges[rank]}
              </Badge>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {rankIcons[rank]}
                </div>
                
                {project.logoUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative group">
                    <img 
                      src={project.logoUrl} 
                      alt={`${project.companyName} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-bold text-gray-900 truncate">
                    {project.companyName || "Stealth Startup"}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{project.ecosystem || "Multi-chain"}</Badge>
                    <Badge variant="outline">{project.vertical || "General"}</Badge>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border">
                    <ArrowUp className="h-4 w-4 text-primary" />
                    <span className="font-bold text-lg">{project.voteCount || 0}</span>
                  </div>
                  <span className="text-xs text-gray-500">votes</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {project.traction && (
                  <div>
                    <p className="text-sm text-gray-700 line-clamp-2">{project.traction}</p>
                  </div>
                )}
                
                {project.amountRaising && (
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600 font-medium">
                      Raising ${(project.amountRaising / 1000000).toFixed(1)}M
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {project.websiteUrl && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {project.linkedinUrl && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={project.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {project.twitterUrl && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={project.twitterUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <X className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
      </Link>
    );
  };

  const ProjectCard = ({ project }: { project: any }) => (
    <Link href={`/project/${project.id}`}>
      <a className="block">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            {project.logoUrl && (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative group">
                <img 
                  src={project.logoUrl} 
                  alt={`${project.companyName} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Social media overlay icons */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-1">
                  {project.websiteUrl && (
                    <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" 
                       onClick={(e) => e.stopPropagation()}
                       className="text-white hover:text-gray-300 transition-colors">
                      <Globe className="h-3 w-3" />
                    </a>
                  )}
                  {project.linkedinUrl && (
                    <a href={project.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                       onClick={(e) => e.stopPropagation()}
                       className="text-white hover:text-gray-300 transition-colors">
                      <Linkedin className="h-3 w-3" />
                    </a>
                  )}
                  {project.twitterUrl && (
                    <a href={project.twitterUrl} target="_blank" rel="noopener noreferrer" 
                       onClick={(e) => e.stopPropagation()}
                       className="text-white hover:text-gray-300 transition-colors">
                      <X className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{project.companyName || "Stealth Startup"}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{project.ecosystem || "Multi-chain"}</Badge>
                <Badge variant="outline">{project.vertical || "General"}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={project.hasVoted ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleVote(project.id, project.hasVoted);
              }}
              disabled={voteMutation.isPending}
              className="flex items-center space-x-1"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {project.traction && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-1">Traction</h4>
              <p className="text-sm text-gray-600">{project.traction}</p>
            </div>
          )}
          
          {project.amountRaising && (
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">
                Raising ${(project.amountRaising / 1000000).toFixed(1)}M
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {project.websiteUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.linkedinUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a href={project.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.twitterUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a href={project.twitterUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <X className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.dataRoomUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a href={project.dataRoomUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="h-4 w-4" />
                  Data Room
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
        </Card>
      </a>
    </Link>
  );

  const filteredRemainingProjects = remainingProjects.filter((project: any) =>
    project.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.traction?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Scout Emerging Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover and vote for the most promising Web3 startups. Featured projects get premium visibility to our network of VCs & Angels.</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <div className="flex gap-4">
              <select
                value={selectedEcosystem}
                onChange={(e) => setSelectedEcosystem(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="All">All Ecosystems</option>
                <option value="Ethereum">Ethereum</option>
                <option value="Binance Smart Chain">Binance Smart Chain</option>
                <option value="Avalanche">Avalanche</option>
                <option value="Cardano">Cardano</option>
                <option value="TON">TON</option>
                <option value="Sui">Sui</option>
                <option value="Polkadot">Polkadot</option>
                <option value="Cosmos">Cosmos</option>
                <option value="Optimism">Optimism</option>
                <option value="Apotos">Apotos</option>
                <option value="Hedera">Hedera</option>
                <option value="Base">Base</option>
                <option value="Stellar">Stellar</option>
                <option value="Arbitrum">Arbitrum</option>
                <option value="Bitcoin">Bitcoin</option>
                <option value="Solana">Solana</option>
                <option value="Polygon">Polygon</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={selectedVertical}
                onChange={(e) => setSelectedVertical(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="All">All Verticals</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="Payments">Payments</option>
                <option value="Identity">Identity</option>
                <option value="DAO">DAO</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Meme">Meme</option>
                <option value="Energy">Energy</option>
                <option value="Compute">Compute</option>
                <option value="SocialFi">SocialFi</option>
                <option value="Data">Data</option>
                <option value="Education">Education</option>
                <option value="Privacy">Privacy</option>
                <option value="DeFi">DeFi</option>
                <option value="Gaming">Gaming</option>
                <option value="NFTs">NFTs</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Stablecoins">Stablecoins</option>
                <option value="RWA">RWA</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Social">Social</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Projects Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              🔥 Most Upvoted Projects
            </h2>
            <p className="text-lg text-gray-600">Top community favorites this week</p>
          </div>
          
          {loadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : topProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topProjects.map((project: any, index: number) => (
                <TopProjectCard key={project.id} project={project} rank={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No projects yet. Be the first to submit!</p>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="flex items-center my-12">
          <Separator className="flex-1" />
          <div className="px-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📁 All Projects
            </h3>
          </div>
          <Separator className="flex-1" />
        </div>

        {/* All Projects Section */}
        <div>
          <div className="text-center mb-8">
            <p className="text-gray-600">
              Discover more amazing Web3 projects from the community. One vote every 24 hours.
            </p>
          </div>
          
          {loadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredRemainingProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllProjects ? filteredRemainingProjects : filteredRemainingProjects.slice(0, 9)).map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              
              {/* Show More button if there are more projects */}
              {!showAllProjects && filteredRemainingProjects.length > 9 && (
                <div className="text-center mt-8">
                  <Button 
                    onClick={() => setShowAllProjects(true)}
                    variant="outline"
                    className="px-8 py-2"
                  >
                    View All Projects ({filteredRemainingProjects.length})
                  </Button>
                </div>
              )}
            </>
          ) : remainingProjects.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">All projects are in the top 3! Check back later for more.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No projects found matching your search</p>
            </div>
          )}
        </div>
      </div>
      {/* Footer CTA */}
      {isAuthenticated && (
        <div className="bg-primary text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Want to feature your project?</h2>
            <p className="text-primary-100 mb-6">
              Get premium visibility and reach our network of verified VCs
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/profile">Feature My Project</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}