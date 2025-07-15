import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Shield, Users, X, ExternalLink, Telegram, Calendar } from "lucide-react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
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

// Payment Form Component with Stripe Elements
function PaymentForm({ vc, vcType, userEmail, onSuccess, onClose, amount }: {
  vc: any;
  vcType: string;
  userEmail: string;
  onSuccess: () => void;
  onClose: () => void;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
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
          paymentIntentId: paymentIntent.id,
          vcId: vc.id,
          vcType,
          email: userEmail,
        });

        toast({
          title: "Payment Successful",
          description: "VC contact information unlocked! You now have access to their contact details.",
        });
        
        onClose();
        onSuccess();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        {isProcessing ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
}

export function VCUnlockModal({ vc, isOpen, onClose, vcType, userEmail, onSuccess }: VCUnlockModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Reset client secret when modal closes
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
    }
  }, [isOpen]);

  // Different pricing based on VC type
  const getPrice = () => {
    if (vcType === "platform") {
      return vc.price || 500; // Default $5 for platform VCs in cents
    } else {
      // For Airtable VCs, convert price to cents if it's a dollar amount
      const price = vc.price;
      if (typeof price === 'string' && price.startsWith('$')) {
        const cents = Math.round(parseFloat(price.substring(1)) * 100);
        return Math.max(cents, 50); // Minimum 50 cents for Stripe
      } else if (typeof price === 'number') {
        // Ensure minimum 50 cents for Stripe
        const cents = price < 100 ? price * 100 : price;
        return Math.max(cents, 50); // Minimum 50 cents
      }
      return 50; // Default $0.50 for verified Airtable VCs (minimum Stripe amount)
    }
  };

  const getPriceDisplay = () => {
    // Show the original Airtable price for display, but we'll charge the Stripe minimum
    const originalPrice = vc.price;
    if (typeof originalPrice === 'string' && originalPrice.startsWith('$')) {
      return originalPrice;
    } else if (typeof originalPrice === 'number') {
      return `$${originalPrice.toFixed(2)}`;
    }
    return `$0.50`; // Fallback
  };

  const getActualChargeAmount = () => {
    // This is what we actually charge (Stripe minimum enforcement)
    const price = getPrice();
    return `$${(price / 100).toFixed(2)}`;
  };

  const handleInitiatePayment = async () => {
    const email = userEmail || 'anonymous@example.com';
    
    setIsLoading(true);
    
    try {
      // Track VC request for gamification
      await apiRequest("POST", "/api/vc-request", {
        vcId: vc.id,
        vcType,
        founderEmail: email,
        founderScore: 75, // Default score, could be calculated based on user profile
        tags: vc.sectors || vc['Investment Stage'] ? [vc.sectors?.[0] || vc['Investment Stage']] : ['General'],
        requestType: 'unlock',
        amount: getPrice(),
      });

      // Create payment intent
      const response = await apiRequest("POST", "/api/create-vc-unlock-payment", {
        vcId: vc.id,
        vcType,
        email: email,
        amount: getPrice(),
      });

      const { clientSecret } = await response.json();
      
      if (!clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      setClientSecret(clientSecret);
      
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to setup payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                {vc.price && vc.price < 0.5 ? (
                  <div>
                    <div>Unlock for {getPriceDisplay()}</div>
                    <div className="text-sm font-normal text-amber-600">
                      (Charged {getActualChargeAmount()} - Stripe minimum)
                    </div>
                  </div>
                ) : (
                  `Unlock for ${getPriceDisplay()}`
                )}
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
            {!clientSecret ? (
              <Button 
                onClick={handleInitiatePayment}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Setting up..." : (vc.price && vc.price < 0.5 ? `Pay ${getActualChargeAmount()}` : `Unlock for ${getPriceDisplay()}`)}
              </Button>
            ) : (
              <div className="flex-1">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm 
                    vc={vc}
                    vcType={vcType}
                    userEmail={userEmail || ""}
                    onSuccess={onSuccess || (() => {})}
                    onClose={onClose}
                    amount={getPrice()}
                  />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}