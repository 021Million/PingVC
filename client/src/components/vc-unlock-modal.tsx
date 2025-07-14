import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Shield, Users, X, ExternalLink, Telegram, Calendar } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface VCUnlockModalProps {
  vc: any;
  isOpen: boolean;
  onClose: () => void;
  vcType: "airtable" | "platform";
  userEmail?: string;
  onSuccess?: () => void;
}

export function VCUnlockModal({ vc, isOpen, onClose, vcType, userEmail, onSuccess }: VCUnlockModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Different pricing based on VC type
  const getPrice = () => {
    if (vcType === "platform") {
      return vc.price || 500; // Default $5 for platform VCs in cents
    } else {
      // For Airtable VCs, convert price to cents if it's a dollar amount
      const price = vc.price;
      if (typeof price === 'string' && price.startsWith('$')) {
        return Math.round(parseFloat(price.substring(1)) * 100);
      } else if (typeof price === 'number') {
        return price < 100 ? price * 100 : price; // Assume dollars if < 100, cents if >= 100
      }
      return 500; // Default $5 for verified Airtable VCs
    }
  };

  const getPriceDisplay = () => {
    const price = getPrice();
    return `$${(price / 100).toFixed(2)}`;
  };

  const handleUnlock = async () => {
    if (!userEmail) {
      toast({
        title: "Email Required",
        description: "Please provide your email to unlock VC contact information.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-vc-unlock-payment", {
        vcId: vc.id,
        vcType,
        email: userEmail,
        amount: getPrice(),
      });

      const { clientSecret, paymentIntentId } = await response.json();
      
      if (!clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      // Complete payment with Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await apiRequest("POST", "/api/confirm-vc-unlock-payment", {
          paymentIntentId,
          vcId: vc.id,
          vcType,
          email: userEmail,
        });

        toast({
          title: "Payment Successful",
          description: "VC contact information unlocked! You now have access to their contact details.",
        });
        
        onClose();
        
        // Call success callback to refresh unlock status
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error("Payment was not completed successfully");
      }
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getContactPreview = () => {
    if (vcType === "platform") {
      return vc.contactType === "telegram" ? "Telegram: @hidden" : "Meeting: booking-link-hidden";
    } else {
      return "Contact: hidden until unlocked";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Unlock VC Contact
          </DialogTitle>
          <DialogDescription>
            Pay {getPriceDisplay()} to unlock contact information and connect directly with this investor.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* VC Preview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {vcType === "platform" ? vc.fundName : vc.fund}
                </CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {vcType === "platform" ? vc.partnerName : vc.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {vcType === "platform" ? vc.stage : (vc.stage || "Various stages")}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {vcType === "platform" ? vc.sectors?.join(", ") : vc.specialties?.join(", ")}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {getContactPreview()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Unlock for {getPriceDisplay()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Direct contact information
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {vcType === "platform" 
                    ? (vc.contactType === "telegram" ? "Telegram handle" : "Calendar booking link")
                    : "Calendar booking link reveal"
                  }
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Instant access after payment
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUnlock}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : `Unlock for ${getPriceDisplay()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}