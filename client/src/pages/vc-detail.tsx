import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, Users, Lock, Unlock, Globe, Linkedin, X, Mail, MessageCircle, Calendar, Target, TrendingUp, ArrowLeft, AlertTriangle } from "lucide-react";
import { VCUnlockModal } from "@/components/vc-unlock-modal";
import { RequestCallModal } from "@/components/request-call-modal";
import { useQuery } from "@tanstack/react-query";
import { ImprovedHeader } from "@/components/improved-header";

export function VCDetailPage() {
  const [, params] = useRoute("/vc/:id");
  const [, setLocation] = useLocation();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
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
  
  const isVerified = airtableData?.verifiedVCs?.find((v: any) => v.id === vcId) ? true : false;
  const isUnlocked = unlockStatus?.hasUnlocked || false;

  const handleUnlockClick = () => {
    if (!email) {
      // Create a simple prompt for email and store it
      const userEmail = prompt("Please enter your email to unlock this VC's contact information:");
      if (userEmail && userEmail.includes('@')) {
        localStorage.setItem('email_access_ping', userEmail);
        window.location.reload(); // Refresh to update email state
        return;
      } else if (userEmail) {
        alert("Please enter a valid email address.");
        return;
      } else {
        return; // User cancelled
      }
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
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Schedule a Meeting</p>
                    <a href={vc['Meeting/Calendly Link'] || vc.meetingLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">
                      Book Meeting via Calendly
                    </a>
                  </div>
                </div>
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

    if (!isVerified) {
      // Unverified VC - show request call option
      return (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Unverified Investor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-orange-700">
                This investor hasn't been verified by our team yet. You can request an introduction:
              </p>
              <ul className="text-sm text-orange-600 space-y-1 ml-4">
                <li>• Our team will reach out to the investor</li>
                <li>• We'll facilitate the introduction manually</li>
                <li>• No immediate payment required</li>
                <li>• We'll invite them to join our platform</li>
              </ul>
            </div>
            <Button 
              onClick={() => setShowRequestModal(true)}
              className="w-full bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Request Introduction
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Verified VC - show unlock option
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-700">
            <Lock className="h-5 w-5 mr-2" />
            Contact Information Locked
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-yellow-700">
              This investor's contact details are locked. Unlock access to get:
            </p>
            <ul className="text-sm text-yellow-600 space-y-1 ml-4">
              <li>• Direct email contact</li>
              <li>• Calendly booking link</li>
              <li>• Social media profiles</li>
              <li>• Additional contact methods</li>
            </ul>
          </div>
          <Button 
            onClick={handleUnlockClick}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Unlock Access for ${vc.price || '0.50'}
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
                          {vc.name || "Partner Name"}
                        </CardTitle>
                        <p className="text-lg text-gray-600 mb-3">
                          {vc.title || "Position"} at {vc.fund || "Fund Name"}
                        </p>
                        {/* Enhanced Social Links */}
                        <div className="space-y-2">
                          {vc.linkedin && (
                            <a 
                              href={vc.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Linkedin className="h-4 w-4 mr-2" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {(vc.twitter || vc['X Profile']) && (
                            <a 
                              href={vc.twitter || vc['X Profile']} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <X className="h-4 w-4 mr-2" />
                              <span>X (Twitter)</span>
                            </a>
                          )}
                          {vc.website && (
                            <a 
                              href={vc.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={isVerified 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                        }
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {isVerified ? "Verified" : "Unverified"}
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
                      <p className="text-gray-600">
                        ${vc.price || '0.50'}
                      </p>
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


              </CardContent>
            </Card>



            {/* Bio */}
            {vc.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About {vc.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {vc.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Investment Thesis & Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Thesis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vc['Investment Thesis'] && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {vc['Investment Thesis']}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vc.title && (
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Position</p>
                      <p className="text-gray-600">{vc.title}</p>
                    </div>
                  )}
                </div>
                
                {/* Connect Section */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-3">Connect</p>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      onClick={() => {
                        if (isVerified) {
                          setShowUnlockModal(true);
                        } else {
                          setShowRequestModal(true);
                        }
                      }}
                      className="bg-primary hover:bg-primary/90 w-fit"
                    >
                      Request Intro
                    </Button>
                    {vc.website && (
                      <a 
                        href={vc.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Portfolio Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vc['Portfolio Performance'] ? (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {vc['Portfolio Performance']}
                  </div>
                ) : (
                  <div className="text-gray-600">
                    Portfolio performance information not provided by this investor.
                  </div>
                )}
              </CardContent>
            </Card>
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
      
      <RequestCallModal
        vc={vc}
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          setShowRequestModal(false);
        }}
      />
    </div>
  );
}