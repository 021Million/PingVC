import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, Users, ExternalLink, Lock, Unlock, Globe, Linkedin, X, Mail, MessageCircle, Calendar, Target, TrendingUp } from "lucide-react";
import { VCUnlockModal } from "@/components/vc-unlock-modal";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface AirtableVCCardProps {
  vc: any;
  userEmail?: string;
}

export function AirtableVCCard({ vc, userEmail }: AirtableVCCardProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  // Use provided email or a default email for anonymous access
  const email = userEmail || 'anonymous@example.com';

  // Check if VC is unlocked for this email
  const { data: unlockStatus, isLoading: checkingUnlock } = useQuery({
    queryKey: ["/api/check-vc-unlock", { email, vcId: vc.id, vcType: "airtable" }],
    enabled: !!email,
  });

  const isUnlocked = unlockStatus?.hasUnlocked || false;

  const handleUnlockClick = () => {
    setShowUnlockModal(true);
  };

  const renderContactInfo = () => {
    if (isUnlocked) {
      return (
        <div className="space-y-2">
          <div className="flex items-center text-sm text-green-600">
            <Unlock className="h-4 w-4 mr-2" />
            Unlocked
          </div>
          {vc.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-blue-600" />
              <a href={`mailto:${vc.email}`} className="text-blue-600 hover:underline">
                {vc.email}
              </a>
            </div>
          )}
          {vc.telegram && (
            <div className="flex items-center text-sm">
              <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-gray-600">Telegram: {vc.telegram}</span>
            </div>
          )}
          {(vc['Meeting/Calendly Link'] || vc.meetingLink) && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-green-600" />
              <a href={vc['Meeting/Calendly Link'] || vc.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Book Meeting
              </a>
            </div>
          )}
          {vc.linkedin && (
            <div className="flex items-center text-sm">
              <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
              <a href={vc.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                LinkedIn Profile
              </a>
            </div>
          )}
          {(vc.twitter || vc['X Profile']) && (
            <div className="flex items-center text-sm">
              <X className="h-4 w-4 mr-2 text-gray-400" />
              <a href={vc.twitter || vc['X Profile']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                X Profile
              </a>
            </div>
          )}
          {vc.website && (
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-gray-400" />
              <a href={vc.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Website
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-500">
          <Lock className="h-4 w-4 mr-2" />
          Contact locked
        </div>
        <Button 
          onClick={handleUnlockClick}
          className="w-full bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Unlock for {typeof vc.price === 'string' ? vc.price : `$${vc.price || 5}`}
        </Button>
      </div>
    );
  };

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {vc.Image && Array.isArray(vc.Image) && vc.Image.length > 0 ? (
                <img 
                  src={vc.Image[0].url} 
                  alt={vc.name || "Investor"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg font-medium">
                    {(vc.name || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {vc.fund || "Fund Name"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {vc.name || "Partner Name"}
                {vc.title && (
                  <span className="text-gray-500"> • {vc.title}</span>
                )}
              </p>
            </div>
            
            <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Investment Details */}
          <div className="space-y-2">
            {(vc['Investment Stage'] || vc.stage) && (
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                {Array.isArray(vc['Investment Stage']) ? vc['Investment Stage'].join(", ") : (vc['Investment Stage'] || vc.stage)}
              </div>
            )}
            {vc['Primary Sector'] && (
              <div className="flex items-center text-sm text-gray-600">
                <Target className="h-4 w-4 mr-2" />
                {(() => {
                  const sectors = vc['Primary Sector'];
                  if (Array.isArray(sectors)) {
                    return sectors.slice(0, 2).join(", ") + (sectors.length > 2 ? ` +${sectors.length - 2} more` : "");
                  }
                  return sectors;
                })()}
              </div>
            )}
            {vc.price && (
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                Unlock for ${vc.price}
              </div>
            )}
            {vc.limit && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Limit: {vc.limit}/month
              </div>
            )}
          </div>

          {/* Investment Thesis */}
          {vc['Investment Thesis'] && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Investment Thesis</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {vc['Investment Thesis']}
              </p>
            </div>
          )}

          {/* Bio/Description */}
          {vc.bio && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">About</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {vc.bio}
              </p>
            </div>
          )}

          {/* Contact Information or Unlock Button */}
          {checkingUnlock ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          ) : (
            renderContactInfo()
          )}
        </CardContent>
      </Card>

      <VCUnlockModal
        vc={vc}
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        vcType="airtable"
        userEmail={email}
      />
    </>
  );
}