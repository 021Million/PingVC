import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ImprovedHeader } from "@/components/improved-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  MapPin, 
  DollarSign, 
  Calendar, 
  MessageCircle, 
  ExternalLink,
  Linkedin,
  X,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import PaymentCheckout from "@/components/payment-checkout";

export default function VCDetails() {
  const { id } = useParams<{ id: string }>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: vc, isLoading, error } = useQuery({
    queryKey: [`/api/vcs/${id}`],
    enabled: !!id,
  });

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const formatStages = (stages: string[]) => {
    if (!Array.isArray(stages)) return stages;
    return stages.join(", ");
  };

  const getContactTypeDisplay = (contactType: string) => {
    switch(contactType) {
      case 'telegram': return 'Telegram Direct Messaging';
      case 'meeting': return 'Scheduled Meetings';
      case 'both': return 'Telegram & Meetings';
      default: return contactType;
    }
  };

  const handleUnlock = () => {
    if (vc?.isVerified) {
      setShowPaymentModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-8">
              <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vc) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">VC Not Found</h1>
            <p className="text-gray-600 mb-6">The VC profile you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/ping">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to VCs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Only show verified VCs
  if (!vc.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Under Review</h1>
            <p className="text-gray-600 mb-6">This VC profile is currently being verified and will be available soon.</p>
            <Button asChild>
              <Link href="/ping">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to VCs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/ping">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to VCs
              </Link>
            </Button>
          </div>

          {/* Main Profile Card */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{vc.fundName}</CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-lg text-gray-600 mb-2">{vc.partnerName}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatStages(vc.stage)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Up to {vc.weeklyIntroLimit} intros/week</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(vc.price)}
                  </div>
                  <div className="text-sm text-gray-500">per intro</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Investment Thesis */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Investment Thesis</h3>
                <p className="text-gray-700 leading-relaxed italic">
                  "{vc.investmentThesis}"
                </p>
              </div>

              <Separator />

              {/* Investment Focus */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Investment Focus</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Stages</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(vc.stage) ? vc.stage.map((stage: string) => (
                        <Badge key={stage} variant="outline">
                          {stage}
                        </Badge>
                      )) : (
                        <Badge variant="outline">{vc.stage}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sectors</h4>
                    <div className="flex flex-wrap gap-2">
                      {vc.sectors.map((sector: string) => (
                        <Badge key={sector} variant="outline">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        {getContactTypeDisplay(vc.contactType)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Preferred contact method for introductions
                      </p>
                    </div>
                    <div className="text-gray-400">
                      {vc.contactType === 'telegram' || vc.contactType === 'both' ? (
                        <MessageCircle className="h-6 w-6" />
                      ) : (
                        <Calendar className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  {vc.linkedinUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={vc.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {vc.twitterUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={vc.twitterUrl} target="_blank" rel="noopener noreferrer">
                        <X className="h-4 w-4 mr-2" />
                        X
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Unlock Contact */}
              <div className="text-center py-6">
                <Button 
                  size="lg" 
                  onClick={handleUnlock}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Unlock Contact Details for {formatPrice(vc.price)}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Get direct access to their contact information
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly intro limit:</span>
                    <span className="font-medium">{vc.weeklyIntroLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response time:</span>
                    <span className="font-medium">24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success rate:</span>
                    <span className="font-medium">High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Verified Partner</span>
                </div>
                <p className="text-sm text-gray-600">
                  This VC has been manually verified by our team and is actively investing in Web3 projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <PaymentCheckout 
              type="vc"
              vcId={vc.id}
              vcName={vc.fundName}
              amount={vc.price}
              onSuccess={() => {
                setShowPaymentModal(false);
                window.location.reload();
              }}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}