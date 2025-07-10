import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Upload, Star, TrendingUp, Eye, Lock, Save } from "lucide-react";
import ProjectVisibilityPayment from "@/components/project-visibility-payment";
import confetti from "canvas-confetti";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Project/Founder form state
  const [projectName, setProjectName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [pitchDeckUrl, setPitchDeckUrl] = useState("");
  const [amountRaising, setAmountRaising] = useState("");
  const [traction, setTraction] = useState("");
  const [ecosystem, setEcosystem] = useState("");
  const [vertical, setVertical] = useState("");
  const [description, setDescription] = useState("");
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch founder data if exists
  const { data: founder } = useQuery({
    queryKey: ["/api/founder/me"],
    enabled: !!user,
  });

  // Initialize form fields when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  // Initialize project fields when founder data loads
  useEffect(() => {
    if (founder) {
      setProjectName(founder.companyName || "");
      setLogoUrl(founder.logoUrl || "");
      setPitchDeckUrl(founder.pitchDeckUrl || "");
      setAmountRaising(founder.amountRaising?.toString() || "");
      setTraction(founder.traction || "");
      setEcosystem(founder.ecosystem || "");
      setVertical(founder.vertical || "");
      setDescription(founder.description || "");
    }
  }, [founder]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      await apiRequest("POST", "/api/auth/update-profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/founder/project", data);
    },
    onSuccess: () => {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/founder/me"] });
      toast({
        title: "Project Updated",
        description: "Your project information has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ firstName, lastName });
  };

  const handleSaveProject = () => {
    updateProjectMutation.mutate({
      companyName: projectName,
      logoUrl,
      pitchDeckUrl,
      amountRaising: amountRaising ? parseInt(amountRaising) : null,
      traction,
      ecosystem,
      vertical,
      description,
    });
  };

  const handlePublishProject = () => {
    // First save the project, then open payment modal
    handleSaveProject();
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (result: any) => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    queryClient.invalidateQueries({ queryKey: ["/api/founder/me"] });
    toast({
      title: "Project Published!",
      description: "Your project is now visible in the Scout marketplace.",
    });
  };

  const isProjectComplete = projectName && description;

  const ecosystems = ["Ethereum", "Binance Smart Chain", "Avalanche", "Cardano", "TON", "Sui", "Polkadot", "Cosmos", "Optimism", "Apotos", "Hedera", "Base", "Stellar", "Arbitrum", "Bitcoin", "Solana", "Polygon", "Multi-chain", "Other"];
  const verticals = ["Supply Chain", "Payments", "Identity", "DAO", "Healthcare", "Meme", "Energy", "Compute", "SocialFi", "Data", "Education", "Privacy", "DeFi", "Gaming", "NFTs", "Infrastructure", "Stablecoins", "RWA", "AI/ML", "Social", "Enterprise", "Other"];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please sign in to access your profile.</p>
            <Button onClick={() => window.location.href = '/api/login'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Link href="/" className="flex items-center text-gray-600 hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/api/logout'}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {user.firstName?.[0] || user.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    {isEditingProfile ? (
                      <form onSubmit={handleProfileSubmit} className="space-y-2">
                        <div className="flex space-x-2">
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First name"
                            required
                          />
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                            required
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" size="sm" disabled={updateProfileMutation.isPending}>
                            Save
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setFirstName(user.firstName || "");
                              setLastName(user.lastName || "");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email
                          }
                        </h1>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Founder</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {!isEditingProfile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Project Information
            </CardTitle>
            <p className="text-gray-600">
              Complete your project details to appear in the Scout marketplace.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="projectName">Project/Company Name *</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter your project name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="logoUrl">Company Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://your-logo-url.com/logo.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your logo to a service like Imgur, Cloudinary, or your website and paste the URL here
                  </p>
                </div>

                <div>
                  <Label htmlFor="amountRaising">Amount Raising (USD)</Label>
                  <Input
                    id="amountRaising"
                    type="number"
                    value={amountRaising}
                    onChange={(e) => setAmountRaising(e.target.value)}
                    placeholder="e.g., 500000"
                  />
                </div>

                <div>
                  <Label htmlFor="ecosystem">Ecosystem</Label>
                  <Select value={ecosystem} onValueChange={setEcosystem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ecosystem" />
                    </SelectTrigger>
                    <SelectContent>
                      {ecosystems.map((eco) => (
                        <SelectItem key={eco} value={eco.toLowerCase()}>
                          {eco}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vertical">Vertical</Label>
                  <Select value={vertical} onValueChange={setVertical}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vertical" />
                    </SelectTrigger>
                    <SelectContent>
                      {verticals.map((vert) => (
                        <SelectItem key={vert} value={vert.toLowerCase()}>
                          {vert}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="pitchDeckUrl">Pitch Deck URL</Label>
                <Input
                  id="pitchDeckUrl"
                  type="url"
                  value={pitchDeckUrl}
                  onChange={(e) => setPitchDeckUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project, what problem it solves, and your current traction..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="traction">Traction & Metrics</Label>
                <Textarea
                  id="traction"
                  value={traction}
                  onChange={(e) => setTraction(e.target.value)}
                  placeholder="Share key metrics: users, revenue, partnerships, etc."
                  rows={3}
                />
              </div>

              {/* Project Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Project Status</h4>
                  {founder?.isVisible ? (
                    <div className="flex items-center text-green-600">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Published</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <Lock className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Draft</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {founder?.isVisible 
                    ? "Your project is visible in the Scout marketplace where VCs can discover and vote for it."
                    : "Save your project as a draft or publish it for $9 to make it visible to VCs in the Scout marketplace."
                  }
                </p>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" asChild>
                  <Link href="/scout">View Scout Marketplace</Link>
                </Button>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleSaveProject}
                    disabled={updateProjectMutation.isPending || !isProjectComplete}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProjectMutation.isPending ? "Saving..." : "Save Draft"}
                  </Button>
                  
                  {!founder?.isVisible && (
                    <Button 
                      type="button"
                      onClick={handlePublishProject}
                      disabled={updateProjectMutation.isPending || !isProjectComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Publish for $9
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <ProjectVisibilityPayment
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}