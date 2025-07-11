import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Globe, Linkedin, Twitter, Github, DollarSign, TrendingUp, Users, Calendar, ArrowUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [userEmail, setUserEmail] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get stored email from Scout page access
  useEffect(() => {
    const storedEmail = localStorage.getItem('email_access_scout');
    if (storedEmail) {
      setUserEmail(storedEmail);
    } else if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });

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
      
      setTimeout(() => {
        if (document.body.contains(rocketElement)) {
          document.body.removeChild(rocketElement);
        }
      }, 2000);
    }, index * 200);
  };

  const voteMutation = useMutation({
    mutationFn: async ({ founderId, email }: { founderId: number; email: string }) => {
      const response = await apiRequest("POST", `/api/scout/projects/${founderId}/vote`, { email });
      return response.json();
    },
    onSuccess: () => {
      createRocketAnimation();
      toast({
        title: "Vote submitted! 🚀",
        description: "Your vote has been counted. You can vote again in 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to submit vote";
      toast({
        title: "Vote failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const unvoteMutation = useMutation({
    mutationFn: async ({ founderId, email }: { founderId: number; email: string }) => {
      const response = await apiRequest("POST", `/api/scout/projects/${founderId}/unvote`, { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vote removed",
        description: "Your vote has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to remove vote";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleVote = () => {
    if (!userEmail) {
      toast({
        title: "Email required",
        description: "Please provide an email to vote",
        variant: "destructive",
      });
      return;
    }

    if (project.hasVoted) {
      unvoteMutation.mutate({ founderId: project.id, email: userEmail });
    } else {
      voteMutation.mutate({ founderId: project.id, email: userEmail });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Link href="/scout">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scout
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Ping Me</span>
              </a>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/scout">
                <Button variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Scout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Project Header */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {project.logoUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={project.logoUrl} 
                          alt={`${project.companyName} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.companyName}</h1>
                      {project.founderName && (
                        <p className="text-lg text-gray-600">by {project.founderName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {project.ecosystem}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {project.vertical}
                    </Badge>
                  </div>
                </div>

                {/* Vote Section */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-gray-900">{project.votes} votes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ArrowUp className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-900">{project.upvotes} upvotes</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleVote}
                    disabled={voteMutation.isPending || unvoteMutation.isPending}
                    className={`px-6 py-2 font-semibold transition-all ${
                      project.hasVoted 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {project.hasVoted ? "✓ Voted" : "Vote"}
                  </Button>
                </div>

                {/* Description */}
                {project.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed">{project.description}</p>
                  </div>
                )}

                {/* Traction */}
                {project.traction && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Traction</h3>
                    <p className="text-gray-700 leading-relaxed">{project.traction}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Links & Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.websiteUrl && (
                    <a
                      href={project.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="font-medium">Website</span>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  
                  {project.linkedinUrl && (
                    <a
                      href={project.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium">LinkedIn</span>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  
                  {project.twitterUrl && (
                    <a
                      href={project.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Twitter className="h-5 w-5 text-blue-400 mr-3" />
                      <span className="font-medium">Twitter</span>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Github className="h-5 w-5 text-gray-800 mr-3" />
                      <span className="font-medium">GitHub</span>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  
                  {project.pitchDeckUrl && (
                    <a
                      href={project.pitchDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="font-medium">Pitch Deck</span>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </a>
                  )}

                  {project.dataRoomUrl && (
                    <a
                      href={project.dataRoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-orange-600 mr-3" />
                      <span className="font-medium">Data Room</span>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fundraising Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Fundraising
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.amountRaising ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${project.amountRaising?.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Target raise</p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center">Not disclosed</p>
                )}
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Votes</span>
                  <span className="font-semibold">{project.votes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upvotes</span>
                  <span className="font-semibold text-green-600">{project.upvotes}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ecosystem</span>
                  <Badge variant="outline">{project.ecosystem}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vertical</span>
                  <Badge variant="outline">{project.vertical}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Users className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold text-gray-900">Interested in this project?</h3>
                  <p className="text-sm text-gray-600">Connect with founders through our VC network</p>
                  <Link href="/ping">
                    <Button className="w-full">
                      Browse VCs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}