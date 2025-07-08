import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, CreditCard, Coins } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { isUnauthorizedError } from "@/lib/authUtils";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY - payment functionality will not work');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface PaymentModalProps {
  vc: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ vc, isOpen, onClose }: PaymentModalProps) {
  const { toast } = useToast();

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/create-payment-intent", { vcId: vc.id });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.clientSecret,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePayWithStripe = () => {
    createPaymentMutation.mutate();
  };

  const handlePayWithCrypto = () => {
    toast({
      title: "Coming Soon",
      description: "Crypto payments will be available soon!",
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Unlock VC Contact
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {/* VC Summary */}
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">
                {vc.fundName.split(' ').map((word: string) => word[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{vc.fundName}</h4>
              <p className="text-sm text-gray-600">{vc.stage}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {vc.investmentThesis}
          </p>
        </div>
        
        {/* Pricing */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(vc.price)}</span>
            <div className="text-sm text-gray-600">One-time unlock fee</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h5 className="font-medium text-gray-900 mb-2">You'll get:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>
                  {vc.contactType === 'telegram' ? 'Direct Telegram handle' : 'Direct meeting link'}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>AI-generated intro template</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>30-day money-back guarantee</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Payment Options */}
        <div className="space-y-3">
          <Button 
            onClick={handlePayWithStripe}
            disabled={createPaymentMutation.isPending}
            className="w-full bg-primary text-white hover:bg-indigo-700 transition-colors"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {createPaymentMutation.isPending ? "Processing..." : `Pay with Card (${formatPrice(vc.price)})`}
          </Button>
          
          <Button 
            onClick={handlePayWithCrypto}
            variant="outline"
            className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Coins className="w-4 h-4 mr-2" />
            Pay with Crypto
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment processed by Stripe. Your information is protected.
        </p>
      </DialogContent>
    </Dialog>
  );
}
