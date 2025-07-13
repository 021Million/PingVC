import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, Users, Lock, Unlock, Globe, Linkedin, X, Mail, MessageCircle, Calendar, Target, TrendingUp, ArrowLeft } from "lucide-react";
import { VCUnlockModal } from "@/components/vc-unlock-modal";
import { useQuery } from "@tanstack/react-query";
import { ImprovedHeader } from "@/components/improved-header";

export function VCDetailPage() {
  const [, params] = useRoute("/vc/:id");
  const [, setLocation] = useLocation();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  const vcId = params?.id;
  const email = localStorage.getItem('email_access_ping');

  // Fetch VC details from Airtable
  const { data: airtableData, isLoading: airtableLoading } = useQuery({
    queryKey: ["/api/airtable/vcs"],
  });

  // Check if VC is unlocked for this email
  const { data: unlockStatus, isLoading: checkingUnlock, refetch: refetchUnlock } = useQuery({
    queryKey: ["/api/check-vc-unlock", { email, vcId, vcType: "airtable" }],
    enabled: !!email && !!vcId,
  });

  const vc = airtableData?.verifiedVCs?.find((v: any) => v.id === vcId) || 
            airtableData?.unverifiedVCs?.find((v: any) => v.id === vcId);
  
  const isUnlocked = unlockStatus?.hasUnlocked || false;

  const handleUnlockClick = () => {
    if (!email) {
      // Redirect to landing page if no email
      setLocation('/');
      return;
    }
    setShowUnlockModal(true);
  };

  const handleUnlockSuccess = () => {
    setShowUnlockModal(false);
    refetchUnlock();
  };

  if (airtableLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vc) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Investor Not Found</h1>
          <p className="text-gray-600 mb-6">The investor you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
        </div>
      </div>
    );
  }

  const renderContactInfo = () => {
    if (isUnlocked) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <Unlock className="h-5 w-5 mr-2" />
              Contact Information Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vc.email && (
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-3 text-blue-600" />
                <a href={`mailto:${vc.email}`} className="text-blue-600 hover:underline">
                  {vc.email}
                </a>
              </div>
            )}
            {vc.telegram && (
              <div className="flex items-center text-sm">
                <MessageCircle className="h-4 w-4 mr-3 text-blue-500" />
                <span className="text-gray-600">Telegram: {vc.telegram}</span>
              </div>
            )}
            {(vc['Meeting/Calendly Link'] || vc.meetingLink) && (
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-3 text-green-600" />
                <a href={vc['Meeting/Calendly Link'] || vc.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Book Meeting
                </a>
              </div>
            )}
            {vc.linkedin && (
              <div className="flex items-center text-sm">
                <Linkedin className="h-4 w-4 mr-3 text-blue-600" />
                <a href={vc.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn Profile
                </a>
              </div>
            )}
            {(vc.twitter || vc['X Profile']) && (
              <div className="flex items-center text-sm">
                <X className="h-4 w-4 mr-3 text-gray-400" />
                <a href={vc.twitter || vc['X Profile']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  X Profile
                </a>
              </div>
            )}
            {vc.website && (
              <div className="flex items-center text-sm">
                <Globe className="h-4 w-4 mr-3 text-gray-400" />
                <a href={vc.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Website
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-700">
            <Lock className="h-5 w-5 mr-2" />
            Contact Information Locked
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-yellow-700">
            This investor's contact details are locked. Unlock access to get their email, Telegram, meeting links, and more.
          </p>
          <Button 
            onClick={handleUnlockClick}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Unlock Access for ${vc.price || 5}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => setLocation('/')} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Homepage
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {vc.Image && Array.isArray(vc.Image) && vc.Image.length > 0 ? (
                      <img 
                        src={vc.Image[0].url} 
                        alt={vc.name || "Investor"}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-2xl font-medium">
                          {(vc.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                          {vc.fund || "Fund Name"}
                        </CardTitle>
                        <p className="text-lg text-gray-600 mb-2">
                          {vc.name || "Partner Name"}
                          {vc.title && (
                            <span className="text-gray-500"> • {vc.title}</span>
                          )}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Investment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(vc['Investment Stage'] || vc.stage) && (
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-3 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Investment Stages</p>
                      <p className="text-gray-600">
                        {Array.isArray(vc['Investment Stage']) ? vc['Investment Stage'].join(", ") : (vc['Investment Stage'] || vc.stage)}
                      </p>
                    </div>
                  </div>
                )}
                
                {vc['Primary Sector'] && (
                  <div className="flex items-center">
                    <Target className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Primary Sectors</p>
                      <p className="text-gray-600">
                        {Array.isArray(vc['Primary Sector']) ? vc['Primary Sector'].join(", ") : vc['Primary Sector']}
                      </p>
                    </div>
                  </div>
                )}

                {vc.price && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Unlock Price</p>
                      <p className="text-gray-600">{vc.price}</p>
                    </div>
                  </div>
                )}

                {vc.limit && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">Monthly Limit</p>
                      <p className="text-gray-600">{vc.limit} introductions</p>
                    </div>
                  </div>
                )}

                {vc['Investment Thesis'] && (
                  <div className="flex items-start">
                    <Target className="h-5 w-5 mr-3 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Investment Thesis</p>
                      <p className="text-gray-600 leading-relaxed">
                        {vc['Investment Thesis']}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>



            {/* Bio */}
            {vc.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About {vc.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {vc.bio}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            {checkingUnlock ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </CardContent>
              </Card>
            ) : (
              renderContactInfo()
            )}
          </div>
        </div>
      </div>

      <VCUnlockModal
        vc={vc}
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        vcType="airtable"
        userEmail={email}
        onSuccess={handleUnlockSuccess}
      />
    </div>
  );
}