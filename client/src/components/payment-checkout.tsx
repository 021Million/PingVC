import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  type: 'project' | 'vc';
  vcId?: number;
  onSuccess?: (result: any) => void;
}

const CheckoutForm = ({ type, vcId, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-success',
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: type === 'project' ? "Your project is now visible!" : "VC contact unlocked!",
      });
      if (onSuccess) {
        onSuccess(true);
      }
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit"
        className="w-full"
        disabled={!stripe || isLoading}
      >
        {isLoading ? "Processing..." : `Complete Payment`}
      </Button>
    </form>
  );
};

interface PaymentCheckoutProps {
  type: 'project' | 'vc';
  vcId?: number;
  vcName?: string;
  amount?: number;
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
}

export default function PaymentCheckout({ type, vcId, vcName, amount, onSuccess, onCancel }: PaymentCheckoutProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(amount || 0);
  const { toast } = useToast();

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    const endpoint = type === 'project' ? '/api/create-project-payment' : '/api/create-vc-payment';
    const payload = type === 'vc' ? { vcId } : {};

    apiRequest("POST", endpoint, payload)
      .then((data) => {
        setClientSecret(data.clientSecret);
        setPaymentAmount(data.amount);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  }, [type, vcId, toast]);

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'project' ? 'Make Project Visible' : `Unlock ${vcName}`}
          </CardTitle>
          <CardDescription>
            {type === 'project' 
              ? 'Pay $49 to make your project visible to VCs and get featured in the marketplace.'
              : `Pay $${paymentAmount} to unlock this VC's contact information and get an AI-generated intro template.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${paymentAmount}</span>
            </div>
          </div>
          <CheckoutForm type={type} vcId={vcId} onSuccess={onSuccess} />
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="w-full mt-4">
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </Elements>
  );
}