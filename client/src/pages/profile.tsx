import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
    companyName: "",
    description: "",
    traction: "",
    websiteUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    githubUrl: "",
    pitchDeckUrl: "",
    dataRoomUrl: "",
    ecosystem: "",
    vertical: "",
    amountRaising: ""
  });

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
        companyName: founderProfile.companyName || "",
        description: founderProfile.description || "",
        traction: founderProfile.traction || "",
        websiteUrl: founderProfile.websiteUrl || "",
        linkedinUrl: founderProfile.linkedinUrl || "",
        twitterUrl: founderProfile.twitterUrl || "",
        githubUrl: founderProfile.githubUrl || "",
        pitchDeckUrl: founderProfile.pitchDeckUrl || "",
        dataRoomUrl: founderProfile.dataRoomUrl || "",
        ecosystem: founderProfile.ecosystem || "",
        vertical: founderProfile.vertical || "",
        amountRaising: founderProfile.amountRaising?.toString() || ""
      });
    } else if (user) {
      setEditForm(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || ""
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
        description: "Your profile has been successfully updated.",
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

  const handleSave = () => {
    const updateData = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      ...(user?.userType === 'founder' && {
        companyName: editForm.companyName,
        description: editForm.description,
        traction: editForm.traction,
        websiteUrl: editForm.websiteUrl,
        linkedinUrl: editForm.linkedinUrl,
        twitterUrl: editForm.twitterUrl,
        githubUrl: editForm.githubUrl,
        pitchDeckUrl: editForm.pitchDeckUrl,
        dataRoomUrl: editForm.dataRoomUrl,
        ecosystem: editForm.ecosystem,
        vertical: editForm.vertical,
        amountRaising: editForm.amountRaising ? parseInt(editForm.amountRaising) : null
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
                    <Badge variant={user?.userType === 'vc' ? 'default' : 'secondary'}>
                      {user?.userType === 'vc' ? 'VC Partner' : 'Founder'}
                    </Badge>
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">User Type</span>
                        <Badge variant="outline">{user?.userType}</Badge>
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
                      <span className="text-gray-600">Account Type</span>
                      <span className="font-medium capitalize">{user?.userType}</span>
                    </div>
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
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                              id="companyName"
                              value={editForm.companyName}
                              onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="traction">Traction</Label>
                            <Textarea
                              id="traction"
                              value={editForm.traction}
                              onChange={(e) => setEditForm(prev => ({ ...prev, traction: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="ecosystem">Ecosystem</Label>
                              <select
                                id="ecosystem"
                                value={editForm.ecosystem}
                                onChange={(e) => setEditForm(prev => ({ ...prev, ecosystem: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="">Select Ecosystem</option>
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
                            </div>
                            <div>
                              <Label htmlFor="vertical">Vertical</Label>
                              <select
                                id="vertical"
                                value={editForm.vertical}
                                onChange={(e) => setEditForm(prev => ({ ...prev, vertical: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="">Select Vertical</option>
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
                          <div>
                            <Label htmlFor="amountRaising">Amount Raising ($)</Label>
                            <Input
                              id="amountRaising"
                              type="number"
                              value={editForm.amountRaising}
                              onChange={(e) => setEditForm(prev => ({ ...prev, amountRaising: e.target.value }))}
                            />
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