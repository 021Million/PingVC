import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface CheckoutFormProps {
  decisionMakerId: number;
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ decisionMakerId, email, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-decision-maker-payment", {
        email,
        decisionMakerId,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create payment");
      }

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email,
          },
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm the unlock on the backend
        await apiRequest("POST", "/api/confirm-decision-maker-unlock", {
          paymentIntentId: paymentIntent.id,
          email,
          decisionMakerId,
        });

        toast({
          title: "Payment Successful!",
          description: "Contact information has been unlocked.",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Something went wrong with your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Unlock Decision Maker Contact</h3>
        <p className="text-gray-600 mt-2">
          Pay $1 to unlock LinkedIn and X profiles for this decision maker.
        </p>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>

      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isProcessing ? "Processing..." : "Pay $1"}
        </Button>
      </div>
    </form>
  );
};

interface DecisionMakerPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  decisionMakerId: number;
  email: string;
  onSuccess: () => void;
}

export default function DecisionMakerPayment({ 
  isOpen, 
  onClose, 
  decisionMakerId, 
  email, 
  onSuccess 
}: DecisionMakerPaymentProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            decisionMakerId={decisionMakerId}
            email={email}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}