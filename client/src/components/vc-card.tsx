import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lock, Calendar, MessageCircle, Clock } from "lucide-react";
import PaymentCheckout from "@/components/payment-checkout";
import { useState } from "react";

interface VCCardProps {
  vc: any;
  isAuthenticated: boolean;
}

export function VCCard({ vc, isAuthenticated }: VCCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getVerificationIcon = () => {
    if (vc.isVerified) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    return <Clock className="w-4 h-4 text-warning" />;
  };

  const getVerificationStatus = () => {
    if (vc.isVerified) {
      return "Verified";
    }
    return "Pending Review";
  };

  const handleUnlock = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    setShowPaymentModal(true);
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <>
      <Card className="hover:shadow-xl transition-shadow duration-200 border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {vc.fundName.split(' ').map((word: string) => word[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{vc.fundName}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{vc.stage}</span>
                  {getVerificationIcon()}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-warning text-warning-foreground">
              {formatPrice(vc.price)}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            "{vc.investmentThesis}"
          </p>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {vc.sectors.slice(0, 3).map((sector: string) => (
              <Badge key={sector} variant="outline" className="text-xs">
                {sector}
              </Badge>
            ))}
            {vc.sectors.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{vc.sectors.length - 3}
              </Badge>
            )}
          </div>
          
          {/* Contact Preview */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4 relative">
            <div className={vc.isVerified ? "blur-contact" : ""}>
              <div className="text-xs text-gray-500 mb-1">
                {vc.contactType === 'telegram' ? 'Telegram Contact' : 'Meeting Link'}
              </div>
              <div className="font-mono text-sm flex items-center">
                {vc.contactType === 'telegram' ? (
                  <MessageCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                {vc.contactType === 'telegram' ? '@example_handle' : 'calendly.com/example'}
              </div>
            </div>
            {vc.isVerified && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-400" />
              </div>
            )}
            {!vc.isVerified && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 rounded-lg">
                <div className="text-center">
                  <Clock className="w-6 h-6 text-warning mx-auto mb-1" />
                  <div className="text-xs text-gray-600">Pending Verification</div>
                </div>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleUnlock}
            disabled={!vc.isVerified}
            className={`w-full font-semibold transition-colors ${
              vc.isVerified 
                ? "bg-primary text-white hover:bg-indigo-700" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {vc.isVerified 
              ? `Unlock for ${formatPrice(vc.price)}`
              : `Pending Verification`
            }
          </Button>
        </CardContent>
      </Card>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <PaymentCheckout 
              type="vc"
              vcId={vc.id}
              vcName={vc.fundName}
              onSuccess={() => {
                setShowPaymentModal(false);
                window.location.reload(); // Refresh to show unlocked content
              }}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
