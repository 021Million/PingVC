import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: vcs = [], isLoading: vcsLoading } = useQuery({
    queryKey: ["/api/admin/vcs"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const verifyVCMutation = useMutation({
    mutationFn: async ({ vcId, isVerified }: { vcId: number; isVerified: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/vcs/${vcId}/verify`, { isVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vcs"] });
      toast({
        title: "Success",
        description: "VC verification status updated",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const pendingVCs = vcs.filter((vc: any) => !vc.isVerified);
  const verifiedVCs = vcs.filter((vc: any) => vc.isVerified);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ping Me Admin</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="text-gray-700 hover:text-primary font-medium"
              >
                Back to App
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-700 hover:text-primary font-medium"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-warning mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingVCs.length}</p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-success mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{verifiedVCs.length}</p>
                  <p className="text-sm text-gray-600">Verified VCs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">{vcs.length}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{vcs.length}</p>
                  <p className="text-sm text-gray-600">Total VCs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending VCs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 text-warning mr-2" />
              Pending Verification ({pendingVCs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vcsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : pendingVCs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending VCs</p>
            ) : (
              <div className="space-y-4">
                {pendingVCs.map((vc: any) => (
                  <div key={vc.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {vc.fundName.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{vc.fundName}</h3>
                            <p className="text-sm text-gray-600">{vc.partnerName} • {vc.stage}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{vc.investmentThesis}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {vc.sectors.map((sector: string) => (
                            <Badge key={sector} variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Contact:</span> {vc.contactType === 'telegram' ? 'Telegram' : 'Meeting'} • 
                          <span className="font-medium"> Price:</span> ${(vc.price / 100).toFixed(2)} • 
                          <span className="font-medium"> Limit:</span> {vc.weeklyIntroLimit}/week
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Handle:</span> {vc.contactHandle}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => verifyVCMutation.mutate({ vcId: vc.id, isVerified: true })}
                          disabled={verifyVCMutation.isPending}
                          className="bg-success hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => verifyVCMutation.mutate({ vcId: vc.id, isVerified: false })}
                          disabled={verifyVCMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verified VCs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 text-success mr-2" />
              Verified VCs ({verifiedVCs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verifiedVCs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No verified VCs yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedVCs.map((vc: any) => (
                  <div key={vc.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {vc.fundName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{vc.fundName}</h3>
                        <p className="text-xs text-gray-600">{vc.partnerName}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${(vc.price / 100).toFixed(2)} • {vc.stage}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyVCMutation.mutate({ vcId: vc.id, isVerified: false })}
                      disabled={verifyVCMutation.isPending}
                      className="mt-2 w-full"
                    >
                      Revoke Verification
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
