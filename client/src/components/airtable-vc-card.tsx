import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, Users, ExternalLink, Lock, Unlock, Globe, Linkedin, X } from "lucide-react";
import { VCUnlockModal } from "@/components/vc-unlock-modal";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface AirtableVCCardProps {
  vc: any;
  userEmail?: string;
}

export function AirtableVCCard({ vc, userEmail }: AirtableVCCardProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  const email = userEmail || localStorage.getItem('email_access_ping');

  // Check if VC is unlocked for this email
  const { data: unlockStatus, isLoading: checkingUnlock } = useQuery({
    queryKey: ["/api/check-vc-unlock", { email, vcId: vc.id, vcType: "airtable" }],
    enabled: !!email,
  });

  const isUnlocked = unlockStatus?.hasUnlocked || false;

  const handleUnlockClick = () => {
    if (!email) {
      // This shouldn't happen since email gate blocks access
      return;
    }
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
          {vc.website && (
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-gray-400" />
              <a href={vc.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {vc.website.replace(/^https?:\/\//, '')}
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
          {vc.twitter && (
            <div className="flex items-center text-sm">
              <X className="h-4 w-4 mr-2 text-gray-400" />
              <a href={vc.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Twitter
              </a>
            </div>
          )}
          {vc.email && (
            <div className="flex items-center text-sm">
              <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
              <a href={`mailto:${vc.email}`} className="text-blue-600 hover:underline">
                {vc.email}
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
          Unlock for $5
        </Button>
      </div>
    );
  };

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {vc.fund || "Fund Name"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {vc.name || "Partner Name"}
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Investment Details */}
          <div className="space-y-2">
            {vc.stage && (
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                {vc.stage}
              </div>
            )}
            {vc.specialties && vc.specialties.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {vc.specialties.slice(0, 2).join(", ")}
                {vc.specialties.length > 2 && ` +${vc.specialties.length - 2} more`}
              </div>
            )}
          </div>

          {/* Bio/Description */}
          {vc.bio && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {vc.bio}
            </p>
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