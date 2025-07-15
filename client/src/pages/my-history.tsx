import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Mail, MessageCircle, Shield, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ImprovedHeader } from "@/components/improved-header";

export default function MyHistory() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: history, isLoading, error } = useQuery({
    queryKey: ["/api/my-history"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My VC History</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your request and booking history.</p>
            <Button asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">Failed to load your history. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'unlock':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'booking_request':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'unlock':
        return 'Verified Unlock';
      case 'booking_request':
        return 'Introduction Request';
      default:
        return 'Request';
    }
  };

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case 'unlock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'booking_request':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const requests = history?.requests || [];
  const unlocks = history?.unlocks || [];
  const totalRequests = history?.totalRequests || 0;
  const totalUnlocks = history?.totalUnlocks || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My VC History</h1>
            <p className="text-xl text-gray-600">
              Track your VC requests, unlocks, and connections
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">VC Unlocks</p>
                    <p className="text-2xl font-bold text-gray-900">{totalUnlocks}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalRequests > 0 ? Math.round((totalUnlocks / totalRequests) * 100) : 0}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Request History */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Request History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No requests yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Start by browsing VCs and making your first connection
                  </p>
                  <Button asChild>
                    <Link href="/vcs">Browse VCs</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getRequestTypeIcon(request.requestType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{request.vcName}</h4>
                          {request.partnerName && (
                            <p className="text-sm text-gray-600">{request.partnerName}</p>
                          )}
                          <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {request.amount && (
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {(request.amount / 100).toFixed(2)}
                          </div>
                        )}
                        <Badge 
                          variant="outline" 
                          className={getRequestTypeBadge(request.requestType)}
                        >
                          {getRequestTypeLabel(request.requestType)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}