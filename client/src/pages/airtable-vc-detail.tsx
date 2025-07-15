import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  DollarSign, 
  Users, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Globe, 
  Linkedin, 
  X, 
  Mail, 
  MessageCircle, 
  Calendar, 
  Target, 
  TrendingUp,
  ArrowLeft,
  Building,
  MapPin,
  Briefcase,
  Heart,
  BarChart3
} from "lucide-react";
import { VCUnlockModal } from "@/components/vc-unlock-modal";
import { ImprovedHeader } from "@/components/improved-header";
import { useState } from "react";
import { Link } from "wouter";

export default function AirtableVCDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Fetch all Airtable VCs and find the one with matching ID
  const { data: airtableData, isLoading } = useQuery({
    queryKey: ["/api/airtable/vcs"],
  });

  const vc = airtableData?.verifiedVCs?.find((v: any) => v.id === id);

  // Check if VC is unlocked (using anonymous email for demo)
  const { data: unlockStatus, isLoading: checkingUnlock } = useQuery({
    queryKey: ["/api/check-vc-unlock", { email: 'anonymous@example.com', vcId: id, vcType: "airtable" }],
    enabled: !!id,
  });

  // Get VC stats including request count
  const { data: vcStats } = useQuery({
    queryKey: ["/api/vc-stats", { vcId: id, vcType: "airtable" }],
    enabled: !!id,
  });

  const isUnlocked = unlockStatus?.hasUnlocked || false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vc) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Investor Not Found</h1>
            <p className="text-gray-600 mb-6">The investor profile you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleUnlockClick = () => {
    setShowUnlockModal(true);
  };

  const renderContactInfo = () => {
    if (isUnlocked) {
      return (
        <div className="space-y-4">
          <div className="flex items-center text-green-600">
            <Unlock className="h-5 w-5 mr-2" />
            <span className="font-medium">Contact Information Unlocked</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vc.email && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <a href={`mailto:${vc.email}`} className="text-blue-600 hover:underline">
                    {vc.email}
                  </a>
                </div>
              </div>
            )}
            
            {vc.telegram && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <MessageCircle className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Telegram</p>
                  <span className="text-gray-900">{vc.telegram}</span>
                </div>
              </div>
            )}
            
            {(vc['Meeting/Calendly Link'] || vc.meetingLink) && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 mr-3 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Meeting</p>
                  <a 
                    href={vc['Meeting/Calendly Link'] || vc.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-green-600 hover:underline"
                  >
                    Book a Meeting
                  </a>
                </div>
              </div>
            )}
            
            {vc.linkedin && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Linkedin className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                  <a href={vc.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Profile
                  </a>
                </div>
              </div>
            )}
            
            {(vc.twitter || vc['X Profile']) && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <X className="h-5 w-5 mr-3 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">X (Twitter)</p>
                  <a href={vc.twitter || vc['X Profile']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Profile
                  </a>
                </div>
              </div>
            )}
            
            {(vc.website || vc.Website) && (
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <Globe className="h-5 w-5 mr-3 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Website</p>
                  <a href={vc.website || vc.Website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information Locked</h3>
        <p className="text-gray-600 mb-4">
          Unlock to access email, social profiles, and direct contact methods
        </p>
        <Button 
          onClick={handleUnlockClick}
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <DollarSign className="h-5 w-5 mr-2" />
          Unlock for {typeof vc.price === 'string' ? vc.price : `$${vc.price || 5}`}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Header Section */}
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {vc.Image && Array.isArray(vc.Image) && vc.Image.length > 0 ? (
                  <img 
                    src={vc.Image[0].url} 
                    alt={vc.name || "Investor"}
                    className="w-24 h-24 rounded-full object-cover mx-auto md:mx-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto md:mx-0">
                    <span className="text-gray-500 text-2xl font-medium">
                      {(vc.name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    {vc.fund || "Fund Name"}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit mx-auto md:mx-0">
                    <Shield className="h-4 w-4 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {vc.name && (
                    <div className="flex items-center justify-center md:justify-start text-lg text-gray-700">
                      <Briefcase className="h-5 w-5 mr-2" />
                      {vc.name}
                      {(vc.title || vc.position) && <span className="text-gray-500 ml-1">• {vc.title || vc.position}</span>}
                    </div>
                  )}
                  
                  {(vc.location || vc.Location) && (
                    <div className="flex items-center justify-center md:justify-start text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {vc.location || vc.Location}
                    </div>
                  )}

                  {(vc['Investment Tag'] || vc.investmentTag) && (
                    <div className="flex items-center justify-center md:justify-start text-gray-600">
                      <Target className="h-4 w-4 mr-2" />
                      {vc['Investment Tag'] || vc.investmentTag}
                    </div>
                  )}

                  {vcStats && (
                    <div className="flex items-center justify-center md:justify-start text-gray-600">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {vcStats.totalRequests || 0} connection requests
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investment Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Investment Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(vc['Investment Stage'] || vc.stage) && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Investment Stages</h4>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(vc['Investment Stage']) ? vc['Investment Stage'] : [vc['Investment Stage'] || vc.stage]).map((stage: string) => (
                        <Badge key={stage} variant="outline" className="bg-blue-50 text-blue-700">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {vc['Primary Sector'] && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Sectors</h4>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(vc['Primary Sector']) ? vc['Primary Sector'] : [vc['Primary Sector']]).map((sector: string) => (
                        <Badge key={sector} variant="outline" className="bg-purple-50 text-purple-700">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Thesis */}
            {vc['Investment Thesis'] && (
              <Card>
                <CardHeader>
                  <CardTitle>Investment Thesis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{vc['Investment Thesis']}</p>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Performance */}
            {(vc['Portfolio Performance'] || vc.portfolioPerformance) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Portfolio Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{vc['Portfolio Performance'] || vc.portfolioPerformance}</p>
                </CardContent>
              </Card>
            )}

            {/* Bio/About */}
            {vc.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{vc.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Investment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vc.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Unlock Price</span>
                    <span className="font-medium">${vc.price}</span>
                  </div>
                )}
                
                {vc.limit && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monthly Limit</span>
                    <span className="font-medium">{vc.limit} connections</span>
                  </div>
                )}
                
                {vc['Check Size'] && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Check Size</span>
                    <span className="font-medium">{vc['Check Size']}</span>
                  </div>
                )}

                {vcStats && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Requests</span>
                    <span className="font-medium">{vcStats.totalRequests || 0}</span>
                  </div>
                )}

                {(vc['Donate To Charity'] || vc.donateToCharity) && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Heart className="h-4 w-4 mr-1 text-red-500" />
                      Donates to Charity
                    </span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checkingUnlock ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  renderContactInfo()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <VCUnlockModal
        vc={vc}
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        vcType="airtable"
        userEmail="anonymous@example.com"
      />
    </div>
  );
}