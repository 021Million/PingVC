import { useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, TrendingUp } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  onSuccess: (result: any) => void;
  onCancel: () => void;
}

const CheckoutForm = ({ onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      // Payment succeeded
      onSuccess({ success: true });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex space-x-3">
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? "Processing..." : "Pay $9 & Publish"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

interface ProjectVisibilityPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export default function ProjectVisibilityPayment({ isOpen, onClose, onSuccess }: ProjectVisibilityPaymentProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async () => {
    if (isLoading || clientSecret) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-project-visibility-payment");
      const data = await response.json();
      
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (error) {
      console.error("Failed to initialize payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async (result: any) => {
    try {
      // Confirm the payment with our backend
      const response = await apiRequest("POST", "/api/confirm-payment", {
        paymentIntentId
      });
      const data = await response.json();
      
      if (data.success) {
        onSuccess(data);
        onClose();
      }
    } catch (error) {
      console.error("Failed to confirm payment:", error);
    }
  };

  const handleCancel = () => {
    setClientSecret("");
    setPaymentIntentId("");
    onClose();
  };

  // Initialize payment when dialog opens
  if (isOpen && !clientSecret && !isLoading) {
    initializePayment();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-green-600" />
            Publish Your Project
          </DialogTitle>
          <DialogDescription>
            Make your project visible in the Scout marketplace for VCs to discover
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Benefits */}
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-green-900">What you get:</h4>
            <div className="space-y-1 text-sm text-green-800">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Visible in Scout marketplace
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Discoverable by VCs
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Public voting & ranking
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Permanent visibility
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-gray-900">$9</div>
            <div className="text-sm text-gray-600">One-time payment</div>
            <Badge variant="outline" className="mt-2">No recurring fees</Badge>
          </div>

          {/* Payment form */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-600 mt-2">Setting up payment...</p>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </Elements>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}