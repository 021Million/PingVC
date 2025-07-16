import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  User, 
  Building, 
  DollarSign, 
  Globe, 
  Edit3,
  X,
  CheckCircle,
  Calendar,
  Mail,
  History,
  Shield,
  ExternalLink,
  LogOut,
  Trash2
} from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    newPassword: "",
  });
  
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch founder profile
  const { data: founderProfile } = useQuery({
    queryKey: ["/api/profile/founder"],
    enabled: user?.userType === 'founder',
  });

  // Fetch user's VC profiles
  const { data: userVCs = [] } = useQuery({
    queryKey: ["/api/profile/vcs"],
    enabled: (user?.userType === 'vc' || user?.userType === 'angel') && user?.isApprovedInvestor,
  });

  // Fetch activity history
  const { data: history } = useQuery({
    queryKey: ["/api/my-history"],
    enabled: user?.userType === 'founder',
  });

  // Fetch investor activity history
  const { data: investorActivity } = useQuery({
    queryKey: ["/api/profile/investor-activity"],
    enabled: user?.userType === 'vc' || user?.userType === 'angel',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      const res = await apiRequest("PUT", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/auth/delete-account");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      // Clear all cached data and redirect to home
      queryClient.clear();
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user && isEditing) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        newPassword: "",
      });
    }
  }, [user, isEditing]);

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
            <Link href="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <Badge variant="outline" className="capitalize">
                      {user?.userType === 'vc' ? 'VC' : user?.userType === 'angel' ? 'Angel' : 'Founder'}
                    </Badge>
                    {user?.isAdmin && (
                      <Badge variant="outline" className="border-purple-200 text-purple-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {(user?.userType === 'vc' || user?.userType === 'angel') && user?.isApprovedInvestor && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved Investor
                      </Badge>
                    )}
                    {(user?.userType === 'vc' || user?.userType === 'angel') && !user?.isApprovedInvestor && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Pending Approval
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
                      Signed up {new Date(user?.createdAt || '').toLocaleDateString()}
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

        {/* Profile Content Tabs */}
        <Tabs defaultValue={getDefaultTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {user?.userType === 'founder' && <TabsTrigger value="project">Project Details</TabsTrigger>}
            {(user?.userType === 'vc' || user?.userType === 'angel') && <TabsTrigger value="investor">Investor Profile</TabsTrigger>}
            <TabsTrigger value="history">Activity History</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>

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
                      {founderProfile ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Company Name</Label>
                              <p className="text-lg font-semibold">{founderProfile.companyName || 'Not set'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Founder Name</Label>
                              <p className="text-lg">{founderProfile.founderName || 'Not set'}</p>
                            </div>
                          </div>

                          {founderProfile.oneLineDescription && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">One-Line Description</Label>
                              <p className="text-gray-800">{founderProfile.oneLineDescription}</p>
                            </div>
                          )}

                          <div className="flex space-x-4 pt-4">
                            <Link href="/project-setup">
                              <Button className="flex items-center">
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Project
                              </Button>
                            </Link>
                            {!founderProfile.isPublished && (
                              <Link href="/project-setup">
                                <Button variant="outline" className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2" />
                                  Publish to Marketplace
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Yet</h3>
                          <p className="text-gray-600 mb-6">
                            Set up your project details to connect with investors.
                          </p>
                          <Link href="/project-setup">
                            <Button className="flex items-center">
                              <Building className="h-4 w-4 mr-2" />
                              Create Project
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar for founders */}
                <div className="space-y-6">
                  {founderProfile && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Project Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <Badge variant={founderProfile.isPublished ? 'default' : 'secondary'}>
                            {founderProfile.isPublished ? 'Live' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Community Votes</span>
                          <span className="font-medium">{founderProfile.votes || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Investor Profile Tab */}
          {(user?.userType === 'vc' || user?.userType === 'angel') && (
            <TabsContent value="investor">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Building className="mr-2 h-5 w-5" />
                          Investor Profile
                        </div>
                        {!user?.isApprovedInvestor && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Pending Approval
                          </Badge>
                        )}
                        {user?.isApprovedInvestor && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved Investor
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!user?.isApprovedInvestor ? (
                        <div className="text-center py-8">
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-orange-900 mb-2">Awaiting Approval</h3>
                            <p className="text-orange-700 mb-4">
                              Your investor profile is under review by the Ping VC team. You'll be able to create and manage your investment profile once approved.
                            </p>
                            <div className="text-sm text-orange-600">
                              <p>• We verify all investors to maintain platform quality</p>
                              <p>• Review typically takes 1-2 business days</p>
                              <p>• You'll receive an email notification once approved</p>
                            </div>
                          </div>
                          <Link href="/vcs">
                            <Button variant="outline">Browse Other Investors</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {userVCs.length > 0 ? (
                            <div className="space-y-4">
                              {userVCs.map((vc: any) => (
                                <div key={vc.id} className="border rounded-lg p-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="font-semibold text-lg">{vc.fundName}</h3>
                                      <p className="text-gray-600 mb-2">{vc.partnerName}</p>
                                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                        <span>${(vc.price / 100).toFixed(0)} intro fee</span>
                                        <Badge variant={vc.isVerified ? 'default' : 'secondary'}>
                                          {vc.isVerified ? 'Live on Platform' : 'Under Review'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Link href={`/vc/${vc.id}`}>
                                      <Button variant="outline" size="sm">
                                        View Profile
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-4">No investor profiles yet</p>
                              <Link href="/vc-signup">
                                <Button>Create Investor Profile</Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar for approved investors */}
                {user?.isApprovedInvestor && (
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                          <h3 className="font-semibold">Approved Investor</h3>
                          <p className="text-sm text-gray-600">
                            You can now create and manage investor profiles on Ping VC
                          </p>
                          <Link href="/vc-signup">
                            <Button className="w-full">
                              Create New Profile
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Activity History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Activity History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.userType === 'founder' ? (
                  // Founder activity history
                  history?.requests?.length > 0 || history?.unlocks?.length > 0 ? (
                    <div className="space-y-4">
                      {history.requests?.map((request: any) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Request to {request.vcName}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline">Requested</Badge>
                          </div>
                        </div>
                      ))}
                      {history.unlocks?.map((unlock: any) => (
                        <div key={unlock.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Unlocked {unlock.vcName}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(unlock.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="default">Unlocked</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No activity yet</p>
                    </div>
                  )
                ) : (
                  // Investor activity history
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Requests Received</h3>
                      {investorActivity?.requestsReceived?.length > 0 ? (
                        <div className="space-y-3">
                          {investorActivity.requestsReceived.map((request: any) => (
                            <div key={request.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{request.founderName}</p>
                                  <p className="text-sm text-gray-600">{request.projectName}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline">{request.status}</Badge>
                                  <p className="text-xs text-gray-500 mt-1">{request.requestType}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">No requests received yet</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Calls Booked</h3>
                      {investorActivity?.callsBooked?.length > 0 ? (
                        <div className="space-y-3">
                          {investorActivity.callsBooked.map((call: any) => (
                            <div key={call.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{call.founderName}</p>
                                  <p className="text-sm text-gray-600">{call.projectName}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(call.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-green-600">${call.amount}</p>
                                  <Badge variant="default">{call.status}</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">No calls booked yet</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Account Settings
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

                    <div className="flex space-x-4">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
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
                        <span className="text-gray-600">Account Type</span>
                        <span className="font-medium capitalize">{user?.userType === 'vc' ? 'VC' : (user?.userType || 'Founder')}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Account Actions</span>
                          <div className="flex space-x-3">
                            <Button 
                              variant="outline" 
                              onClick={() => logoutMutation.mutate()}
                              disabled={logoutMutation.isPending}
                              className="flex items-center"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Sign Out
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  className="flex items-center"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Account
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteAccountMutation.mutate()}
                                    disabled={deleteAccountMutation.isPending}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function getDefaultTab() {
    if (user?.userType === 'founder') return 'project';
    if (user?.userType === 'vc' || user?.userType === 'angel') return 'investor';
    return 'settings';
  }
}