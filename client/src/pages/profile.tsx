import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  Building, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github,
  ExternalLink,
  Edit3,
  Save,
  X,
  CheckCircle,
  Calendar,
  Mail,
  UserCheck
} from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    newPassword: "",
    
    // Founder & Project Basics
    founderName: "",
    companyName: "",
    oneLineDescription: "",
    description: "",
    logoUrl: "",
    websiteUrl: "",
    twitterUrl: "",
    
    // Team & Company Info
    teamSize: "",
    teamRoles: "",
    location: "",
    
    // Ecosystem & Vertical
    ecosystem: "",
    vertical: "",
    
    // Fundraising Info
    isRaising: false,
    roundType: "",
    amountRaising: "",
    valuation: "",
    committedAmount: "",
    idealInvestorType: "",
    
    // Additional Info
    traction: "",
    pitchDeckUrl: "",
    dataRoomUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    lookingFor: "",
    
    // Enhanced fields from Flask template
    revenueGenerating: "",
    stage: "",
    tokenLaunch: false,
    ticker: "",
    capitalRaisedToDate: "",
    dau: ""
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's founder profile if they are a founder
  const { data: founderProfile, isLoading: founderLoading } = useQuery({
    queryKey: ["/api/profile/founder"],
    enabled: isAuthenticated && user?.userType === 'founder',
  });

  // Fetch user's VC profile if they are a VC
  const { data: vcProfile, isLoading: vcLoading } = useQuery({
    queryKey: ["/api/profile/vc"],
    enabled: isAuthenticated && user?.userType === 'vc',
  });

  // Fetch user's created VCs if they are a VC
  const { data: userVCs = [], isLoading: vcsLoading } = useQuery({
    queryKey: ["/api/profile/vcs"],
    enabled: isAuthenticated && user?.userType === 'vc',
  });

  // Update form when founder profile loads
  useEffect(() => {
    if (founderProfile) {
      setEditForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        
        // Founder & Project Basics
        founderName: founderProfile.founderName || "",
        companyName: founderProfile.companyName || "",
        oneLineDescription: founderProfile.oneLineDescription || "",
        description: founderProfile.description || "",
        logoUrl: founderProfile.logoUrl || "",
        websiteUrl: founderProfile.websiteUrl || "",
        twitterUrl: founderProfile.twitterUrl || "",
        
        // Team & Company Info
        teamSize: founderProfile.teamSize ? founderProfile.teamSize.toString() : "",
        teamRoles: founderProfile.teamRoles || "",
        location: founderProfile.location || "",
        
        // Ecosystem & Vertical
        ecosystem: founderProfile.ecosystem || "",
        vertical: founderProfile.vertical || "",
        
        // Fundraising Info
        isRaising: founderProfile.isRaising || false,
        roundType: founderProfile.roundType || "",
        amountRaising: founderProfile.amountRaising ? founderProfile.amountRaising.toString() : "",
        valuation: founderProfile.valuation || "",
        committedAmount: founderProfile.committedAmount ? founderProfile.committedAmount.toString() : "",
        idealInvestorType: founderProfile.idealInvestorType || "",
        
        // Additional Info
        traction: founderProfile.traction || "",
        pitchDeckUrl: founderProfile.pitchDeckUrl || "",
        dataRoomUrl: founderProfile.dataRoomUrl || "",
        linkedinUrl: founderProfile.linkedinUrl || "",
        githubUrl: founderProfile.githubUrl || "",
        lookingFor: founderProfile.lookingFor || "",
        
        // Enhanced fields from Flask template
        revenueGenerating: founderProfile.revenueGenerating || "",
        stage: founderProfile.stage || "",
        tokenLaunch: founderProfile.tokenLaunch || false,
        ticker: founderProfile.ticker || "",
        capitalRaisedToDate: founderProfile.capitalRaisedToDate ? founderProfile.capitalRaisedToDate.toString() : "",
        dau: founderProfile.dau ? founderProfile.dau.toString() : "",
        
        // User account fields
        email: user?.email || "",
        newPassword: ""
      });
    } else if (user) {
      setEditForm(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        newPassword: ""
      }));
    }
  }, [founderProfile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully saved as draft.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/profile/founder"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const publishProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/publish-project");
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.paymentUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Publishing failed",
        description: error.message || "Failed to start publishing process",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updateData = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      ...(editForm.newPassword && { newPassword: editForm.newPassword }),
      ...(user?.userType === 'founder' && {
        // Founder & Project Basics
        founderName: editForm.founderName,
        companyName: editForm.companyName,
        oneLineDescription: editForm.oneLineDescription,
        description: editForm.description,
        logoUrl: editForm.logoUrl,
        websiteUrl: editForm.websiteUrl,
        twitterUrl: editForm.twitterUrl,
        email: editForm.email,
        
        // Team & Company Info
        teamSize: editForm.teamSize ? parseInt(editForm.teamSize) : null,
        teamRoles: editForm.teamRoles,
        location: editForm.location,
        
        // Ecosystem & Vertical
        ecosystem: editForm.ecosystem,
        vertical: editForm.vertical,
        
        // Fundraising Info
        isRaising: editForm.isRaising,
        roundType: editForm.roundType,
        amountRaising: editForm.amountRaising ? parseInt(editForm.amountRaising) : null,
        valuation: editForm.valuation,
        committedAmount: editForm.committedAmount ? parseInt(editForm.committedAmount) : null,
        idealInvestorType: editForm.idealInvestorType,
        
        // Additional Info
        traction: editForm.traction,
        pitchDeckUrl: editForm.pitchDeckUrl,
        dataRoomUrl: editForm.dataRoomUrl,
        linkedinUrl: editForm.linkedinUrl,
        githubUrl: editForm.githubUrl,
        lookingFor: editForm.lookingFor,
        
        // Enhanced fields from Flask template
        revenueGenerating: editForm.revenueGenerating,
        stage: editForm.stage,
        tokenLaunch: editForm.tokenLaunch,
        ticker: editForm.ticker,
        capitalRaisedToDate: editForm.capitalRaisedToDate ? parseInt(editForm.capitalRaisedToDate) : null,
        dau: editForm.dau ? parseInt(editForm.dau) : null
      })
    };

    updateProfileMutation.mutate(updateData);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || "User";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
          <Button onClick={() => window.location.href = '/api/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {getUserDisplayName()}
                  </h1>
                  <div className="flex items-center space-x-4 mb-3">
                    {user?.isAdmin && (
                      <Badge variant="outline" className="border-purple-200 text-purple-800">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {user?.email}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {new Date(user?.createdAt || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className="flex items-center"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={user?.userType === 'founder' ? 'project' : 'overview'} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {user?.userType === 'founder' && <TabsTrigger value="project">My Project</TabsTrigger>}
            {user?.userType === 'vc' && <TabsTrigger value="vcs">My VCs</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={editForm.firstName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={editForm.lastName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your-email@example.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={editForm.newPassword}
                          onChange={(e) => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password (optional)"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Leave empty to keep current password
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name</span>
                        <span className="font-medium">{getUserDisplayName()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email</span>
                        <span className="font-medium">{user?.email}</span>
                      </div>

                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Account Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">

                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium">{new Date(user?.createdAt || '').toLocaleDateString()}</span>
                    </div>
                    {user?.userType === 'founder' && founderProfile && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Project Status</span>
                          <Badge variant={founderProfile.isPublished ? 'default' : 'secondary'}>
                            {founderProfile.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Votes</span>
                          <span className="font-medium">{founderProfile.votes || 0}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Founder Project Tab */}
          {user?.userType === 'founder' && (
            <TabsContent value="project">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Building className="mr-2 h-5 w-5" />
                          Project Details
                        </div>
                        {founderProfile && (
                          <Badge variant={founderProfile.isPublished ? 'default' : 'secondary'}>
                            {founderProfile.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-6">
                          {/* Founder & Project Basics */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🔹 Founder & Project Basics</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="companyName">Project Name *</Label>
                                <Input
                                  id="companyName"
                                  value={editForm.companyName}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                                  placeholder="Your project/company name"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="logoUrl">Logo URL</Label>
                                <Input
                                  id="logoUrl"
                                  value={editForm.logoUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                                  placeholder="https://your-logo-url.com/logo.png"
                                  type="url"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="description">Description *</Label>
                              <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your project in detail..."
                                rows={4}
                                required
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="traction">Traction</Label>
                              <Textarea
                                id="traction"
                                value={editForm.traction}
                                onChange={(e) => setEditForm(prev => ({ ...prev, traction: e.target.value }))}
                                placeholder="E.g., 10K signups, 12% MoM growth, $50K ARR..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="stage">Stage</Label>
                                <Select onValueChange={(value) => setEditForm(prev => ({ ...prev, stage: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Devnet">Devnet</SelectItem>
                                    <SelectItem value="Testnet">Testnet</SelectItem>
                                    <SelectItem value="Mainnet">Mainnet</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Token Launch</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                  <Checkbox
                                    checked={editForm.tokenLaunch}
                                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, tokenLaunch: checked as boolean }))}
                                  />
                                  <span className="text-sm">Yes, we have/plan a token</span>
                                </div>
                              </div>
                            </div>
                            
                            {editForm.tokenLaunch && (
                              <div>
                                <Label htmlFor="ticker">Token Ticker</Label>
                                <Input
                                  id="ticker"
                                  value={editForm.ticker}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                                  placeholder="e.g., ETH, BTC, USDC"
                                  maxLength={10}
                                />
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="vertical">Vertical</Label>
                                <Select onValueChange={(value) => setEditForm(prev => ({ ...prev, vertical: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vertical" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="DeFi">DeFi</SelectItem>
                                    <SelectItem value="Gaming">Gaming</SelectItem>
                                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                    <SelectItem value="NFTs">NFTs</SelectItem>
                                    <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                                    <SelectItem value="Payments">Payments</SelectItem>
                                    <SelectItem value="Identity">Identity</SelectItem>
                                    <SelectItem value="DAO">DAO</SelectItem>
                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                    <SelectItem value="Meme">Meme</SelectItem>
                                    <SelectItem value="Energy">Energy</SelectItem>
                                    <SelectItem value="Compute">Compute</SelectItem>
                                    <SelectItem value="SocialFi">SocialFi</SelectItem>
                                    <SelectItem value="Data">Data</SelectItem>
                                    <SelectItem value="Education">Education</SelectItem>
                                    <SelectItem value="Privacy">Privacy</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="ecosystem">Ecosystem</Label>
                                <Select onValueChange={(value) => setEditForm(prev => ({ ...prev, ecosystem: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ecosystem" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Ethereum">Ethereum</SelectItem>
                                    <SelectItem value="Solana">Solana</SelectItem>
                                    <SelectItem value="Polygon">Polygon</SelectItem>
                                    <SelectItem value="Arbitrum">Arbitrum</SelectItem>
                                    <SelectItem value="Binance Smart Chain">Binance Smart Chain</SelectItem>
                                    <SelectItem value="Avalanche">Avalanche</SelectItem>
                                    <SelectItem value="Cardano">Cardano</SelectItem>
                                    <SelectItem value="TON">TON</SelectItem>
                                    <SelectItem value="Sui">Sui</SelectItem>
                                    <SelectItem value="Polkadot">Polkadot</SelectItem>
                                    <SelectItem value="Cosmos">Cosmos</SelectItem>
                                    <SelectItem value="Optimism">Optimism</SelectItem>
                                    <SelectItem value="Aptos">Aptos</SelectItem>
                                    <SelectItem value="Hedera">Hedera</SelectItem>
                                    <SelectItem value="Base">Base</SelectItem>
                                    <SelectItem value="Stellar">Stellar</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="oneLineDescription">One-Line Description</Label>
                              <Input
                                id="oneLineDescription"
                                value={editForm.oneLineDescription}
                                onChange={(e) => setEditForm(prev => ({ ...prev, oneLineDescription: e.target.value }))}
                                placeholder="What are you building? (1 sentence)"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="description">Detailed Description</Label>
                              <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                placeholder="Problem, solution, traction, etc."
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="logoUrl">Project Logo (Image link)</Label>
                                <Input
                                  id="logoUrl"
                                  value={editForm.logoUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                                  placeholder="https://..."
                                />
                              </div>
                              <div>
                                <Label htmlFor="websiteUrl">Website (or demo link)</Label>
                                <Input
                                  id="websiteUrl"
                                  value={editForm.websiteUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="twitterUrl">Twitter / X Handle (optional)</Label>
                                <Input
                                  id="twitterUrl"
                                  value={editForm.twitterUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, twitterUrl: e.target.value }))}
                                  placeholder="@username or https://..."
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email Contact (for VCs)</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="founder@company.com"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Team & Company Info */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🔹 Team & Company Info</h3>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="teamSize">Number of Team Members</Label>
                                <Input
                                  id="teamSize"
                                  type="number"
                                  value={editForm.teamSize}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, teamSize: e.target.value }))}
                                  placeholder="5"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                  id="location"
                                  value={editForm.location}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                  placeholder="City, Country or Remote"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="teamRoles">Team Member Roles</Label>
                              <Textarea
                                id="teamRoles"
                                value={editForm.teamRoles}
                                onChange={(e) => setEditForm(prev => ({ ...prev, teamRoles: e.target.value }))}
                                rows={3}
                                placeholder="Briefly describe core team roles (e.g., CEO - 10 years tech, CTO - ex-Google engineer, etc.)"
                              />
                            </div>
                          </div>
                          
                          {/* Financial & Metrics */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">💰 Financial & Metrics</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="valuation">Valuation (USD)</Label>
                                <Input
                                  id="valuation"
                                  type="number"
                                  value={editForm.valuation}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, valuation: e.target.value }))}
                                  placeholder="10000000"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional - current company valuation</p>
                              </div>
                              <div>
                                <Label htmlFor="amountRaising">Amount Raising (USD)</Label>
                                <Input
                                  id="amountRaising"
                                  type="number"
                                  value={editForm.amountRaising}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, amountRaising: e.target.value }))}
                                  placeholder="1000000"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="capitalRaisedToDate">Capital Raised To-Date (USD)</Label>
                                <Input
                                  id="capitalRaisedToDate"
                                  type="number"
                                  value={editForm.capitalRaisedToDate}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, capitalRaisedToDate: e.target.value }))}
                                  placeholder="250000"
                                />
                              </div>
                              <div>
                                <Label htmlFor="dau">Daily Active Users (DAU)</Label>
                                <Input
                                  id="dau"
                                  type="number"
                                  value={editForm.dau}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, dau: e.target.value }))}
                                  placeholder="1000"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label>Revenue Generating</Label>
                              <div className="flex items-center space-x-4 pt-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="revenueGenerating"
                                    value="Yes"
                                    checked={editForm.revenueGenerating === "Yes"}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, revenueGenerating: e.target.value }))}
                                  />
                                  <span className="text-sm">Yes</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="revenueGenerating"
                                    value="No"
                                    checked={editForm.revenueGenerating === "No"}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, revenueGenerating: e.target.value }))}
                                  />
                                  <span className="text-sm">No</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Links & Resources */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🔗 Links & Resources</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="websiteUrl">Website</Label>
                                <Input
                                  id="websiteUrl"
                                  type="url"
                                  value={editForm.websiteUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                                  placeholder="https://yourproject.com"
                                />
                              </div>
                              <div>
                                <Label htmlFor="pitchDeckUrl">Deck Link</Label>
                                <Input
                                  id="pitchDeckUrl"
                                  type="url"
                                  value={editForm.pitchDeckUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, pitchDeckUrl: e.target.value }))}
                                  placeholder="Google Drive, Notion, PDF, etc."
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <Separator className="my-6" />
                          <div className="action-buttons flex justify-between items-center">
                            <Button 
                              onClick={handleSave}
                              disabled={updateProfileMutation.isPending}
                              className="flex items-center"
                              variant="outline"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              💾 Save Draft
                            </Button>
                            
                            <Button 
                              onClick={() => {
                                if (confirm('Publish your project to Scout for $9?')) {
                                  publishProjectMutation.mutate();
                                }
                              }}
                              disabled={publishProjectMutation.isPending || !editForm.companyName || !editForm.description}
                              className="flex items-center bg-green-600 hover:bg-green-700"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              🚀 Publish for $9
                            </Button>
                          </div>

                          {/* Fundraising Info */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🔹 Fundraising Info</h3>
                            
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="isRaising"
                                checked={editForm.isRaising}
                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isRaising: !!checked }))}
                              />
                              <Label htmlFor="isRaising">Are you currently fundraising?</Label>
                            </div>
                            
                            {editForm.isRaising && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="roundType">Round Type</Label>
                                    <Select value={editForm.roundType} onValueChange={(value) => setEditForm(prev => ({ ...prev, roundType: value }))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Round" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                                        <SelectItem value="Seed">Seed</SelectItem>
                                        <SelectItem value="Series A">Series A</SelectItem>
                                        <SelectItem value="Series B">Series B</SelectItem>
                                        <SelectItem value="Series C+">Series C+</SelectItem>
                                        <SelectItem value="Bridge">Bridge</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="amountRaising">Amount Raising ($)</Label>
                                    <Input
                                      id="amountRaising"
                                      type="number"
                                      value={editForm.amountRaising}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, amountRaising: e.target.value }))}
                                      placeholder="500000"
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="valuation">Valuation (Pre/Post)</Label>
                                    <Input
                                      id="valuation"
                                      value={editForm.valuation}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, valuation: e.target.value }))}
                                      placeholder="$5M pre-money"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="committedAmount">Amount Already Committed ($)</Label>
                                    <Input
                                      id="committedAmount"
                                      type="number"
                                      value={editForm.committedAmount}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, committedAmount: e.target.value }))}
                                      placeholder="100000"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="idealInvestorType">Ideal Investor Type</Label>
                                  <Select value={editForm.idealInvestorType} onValueChange={(value) => setEditForm(prev => ({ ...prev, idealInvestorType: value }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Investor Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Operator Angel">Operator Angel</SelectItem>
                                      <SelectItem value="Micro VC">Micro VC</SelectItem>
                                      <SelectItem value="Tier 1 VC">Tier 1 VC</SelectItem>
                                      <SelectItem value="Strategic">Strategic</SelectItem>
                                      <SelectItem value="Family Office">Family Office</SelectItem>
                                      <SelectItem value="Accelerator">Accelerator</SelectItem>
                                      <SelectItem value="Any">Any</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Additional Info */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🔹 Additional Info</h3>
                            
                            <div>
                              <Label htmlFor="traction">Traction & Metrics</Label>
                              <Textarea
                                id="traction"
                                value={editForm.traction}
                                onChange={(e) => setEditForm(prev => ({ ...prev, traction: e.target.value }))}
                                rows={3}
                                placeholder="Users, revenue, partnerships, key metrics, etc."
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="pitchDeckUrl">Pitch Deck (optional)</Label>
                                <Input
                                  id="pitchDeckUrl"
                                  value={editForm.pitchDeckUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, pitchDeckUrl: e.target.value }))}
                                  placeholder="https://..."
                                />
                              </div>
                              <div>
                                <Label htmlFor="dataRoomUrl">Data Room (optional)</Label>
                                <Input
                                  id="dataRoomUrl"
                                  value={editForm.dataRoomUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, dataRoomUrl: e.target.value }))}
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="linkedinUrl">LinkedIn (optional)</Label>
                                <Input
                                  id="linkedinUrl"
                                  value={editForm.linkedinUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                  placeholder="https://linkedin.com/in/..."
                                />
                              </div>
                              <div>
                                <Label htmlFor="githubUrl">GitHub (optional)</Label>
                                <Input
                                  id="githubUrl"
                                  value={editForm.githubUrl}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                                  placeholder="https://github.com/..."
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="stage">Development Stage</Label>
                                <Select value={editForm.stage} onValueChange={(value) => setEditForm(prev => ({ ...prev, stage: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Stage" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Idea">Idea</SelectItem>
                                    <SelectItem value="MVP">MVP</SelectItem>
                                    <SelectItem value="Beta">Beta</SelectItem>
                                    <SelectItem value="Live">Live Product</SelectItem>
                                    <SelectItem value="Growth">Growth Stage</SelectItem>
                                    <SelectItem value="Scale">Scale Stage</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="revenueGenerating">Revenue Generating?</Label>
                                <Select value={editForm.revenueGenerating} onValueChange={(value) => setEditForm(prev => ({ ...prev, revenueGenerating: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Revenue Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                    <SelectItem value="Soon">Soon (within 6 months)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="lookingFor">What are you looking for?</Label>
                              <Textarea
                                id="lookingFor"
                                value={editForm.lookingFor}
                                onChange={(e) => setEditForm(prev => ({ ...prev, lookingFor: e.target.value }))}
                                rows={3}
                                placeholder="Funding, advisors, partnerships, talent, feedback, etc."
                              />
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <Separator className="my-6" />
                          <div className="flex justify-between items-center">
                            <Button 
                              onClick={handleSave}
                              disabled={updateProfileMutation.isPending}
                              className="flex items-center"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save as Draft
                            </Button>
                            
                            <Button 
                              onClick={() => publishProjectMutation.mutate()}
                              disabled={publishProjectMutation.isPending || !editForm.companyName || !editForm.description}
                              className="flex items-center bg-green-600 hover:bg-green-700"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Publish for $9
                            </Button>
                          </div>
                        </div>
                      ) : founderProfile ? (
                        <div className="space-y-4">
                          {founderProfile.companyName && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">{founderProfile.companyName}</h3>
                            </div>
                          )}
                          {founderProfile.description && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                              <p className="text-gray-600">{founderProfile.description}</p>
                            </div>
                          )}
                          {founderProfile.traction && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Traction</h4>
                              <p className="text-gray-600">{founderProfile.traction}</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {founderProfile.ecosystem && (
                              <Badge variant="outline">{founderProfile.ecosystem}</Badge>
                            )}
                            {founderProfile.vertical && (
                              <Badge variant="outline">{founderProfile.vertical}</Badge>
                            )}
                          </div>
                          {founderProfile.amountRaising && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                              <span className="font-medium text-green-600">
                                ${founderProfile.amountRaising.toLocaleString()} target raise
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">No project details yet</p>
                          <Link href="/project-setup">
                            <Button>Set Up Project</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Globe className="mr-2 h-5 w-5" />
                        Links & Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="websiteUrl">Website URL</Label>
                            <Input
                              id="websiteUrl"
                              value={editForm.websiteUrl}
                              onChange={(e) => setEditForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                            <Input
                              id="linkedinUrl"
                              value={editForm.linkedinUrl}
                              onChange={(e) => setEditForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          </div>
                          <div>
                            <Label htmlFor="twitterUrl">Twitter URL</Label>
                            <Input
                              id="twitterUrl"
                              value={editForm.twitterUrl}
                              onChange={(e) => setEditForm(prev => ({ ...prev, twitterUrl: e.target.value }))}
                              placeholder="https://twitter.com/yourhandle"
                            />
                          </div>
                          <div>
                            <Label htmlFor="githubUrl">GitHub URL</Label>
                            <Input
                              id="githubUrl"
                              value={editForm.githubUrl}
                              onChange={(e) => setEditForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                              placeholder="https://github.com/yourprofile"
                            />
                          </div>
                          <div>
                            <Label htmlFor="pitchDeckUrl">Pitch Deck URL</Label>
                            <Input
                              id="pitchDeckUrl"
                              value={editForm.pitchDeckUrl}
                              onChange={(e) => setEditForm(prev => ({ ...prev, pitchDeckUrl: e.target.value }))}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="dataRoomUrl">Data Room URL</Label>
                            <Input
                              id="dataRoomUrl"
                              value={editForm.dataRoomUrl}
                              onChange={(e) => setEditForm(prev => ({ ...prev, dataRoomUrl: e.target.value }))}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      ) : founderProfile ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {founderProfile.websiteUrl && (
                            <a href={founderProfile.websiteUrl} target="_blank" rel="noopener noreferrer" 
                               className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                              <Globe className="h-4 w-4 mr-2" />
                              <span className="text-sm">Website</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                          {founderProfile.linkedinUrl && (
                            <a href={founderProfile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                               className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                              <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm">LinkedIn</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                          {founderProfile.twitterUrl && (
                            <a href={founderProfile.twitterUrl} target="_blank" rel="noopener noreferrer"
                               className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                              <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                              <span className="text-sm">Twitter</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                          {founderProfile.githubUrl && (
                            <a href={founderProfile.githubUrl} target="_blank" rel="noopener noreferrer"
                               className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                              <Github className="h-4 w-4 mr-2" />
                              <span className="text-sm">GitHub</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                          {founderProfile.pitchDeckUrl && (
                            <a href={founderProfile.pitchDeckUrl} target="_blank" rel="noopener noreferrer"
                               className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                              <ExternalLink className="h-4 w-4 mr-2 text-purple-600" />
                              <span className="text-sm">Pitch Deck</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                          {founderProfile.dataRoomUrl && (
                            <a href={founderProfile.dataRoomUrl} target="_blank" rel="noopener noreferrer"
                               className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                              <ExternalLink className="h-4 w-4 mr-2 text-orange-600" />
                              <span className="text-sm">Data Room</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-4">No links added yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {founderProfile && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="mr-2 h-5 w-5" />
                          Project Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status</span>
                            <Badge variant={founderProfile.isPublished ? 'default' : 'secondary'}>
                              {founderProfile.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Votes</span>
                            <span className="font-medium">{founderProfile.votes || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Upvotes</span>
                            <span className="font-medium text-green-600">{founderProfile.upvotes || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <Building className="h-8 w-8 text-primary mx-auto" />
                        <h3 className="font-semibold">Quick Actions</h3>
                        <div className="space-y-2">
                          <Link href="/project-setup">
                            <Button variant="outline" className="w-full">
                              {founderProfile ? 'Update Project' : 'Set Up Project'}
                            </Button>
                          </Link>
                          {founderProfile && !founderProfile.isPublished && (
                            <Link href="/project-visibility-payment">
                              <Button className="w-full">
                                Publish Project ($9)
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {/* VC Tab */}
          {user?.userType === 'vc' && (
            <TabsContent value="vcs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      My VC Profiles
                    </div>
                    <Link href="/vc-signup">
                      <Button>
                        Add New VC
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vcsLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : userVCs.length > 0 ? (
                    <div className="space-y-4">
                      {userVCs.map((vc: any) => (
                        <div key={vc.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{vc.fundName}</h3>
                              <p className="text-gray-600 mb-2">{vc.partnerName} • {vc.title}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>${vc.price} intro fee</span>
                                <Badge variant={vc.isVerified ? 'default' : 'secondary'}>
                                  {vc.isVerified ? 'Verified' : 'Pending Review'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              {vc.isVerified && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No VC profiles yet</p>
                      <Link href="/vc-signup">
                        <Button>Create VC Profile</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
                    <div className="border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-red-900">Sign Out</h4>
                          <p className="text-sm text-red-700">Sign out of your account</p>
                        </div>
                        <Button 
                          variant="destructive"
                          onClick={() => window.location.href = '/api/logout'}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Changes Button */}
        {isEditing && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-medium shadow-lg"
            >
              {updateProfileMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}