import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PaymentCheckout from "@/components/payment-checkout";

export default function ProjectVisibilityPayment() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to make your project visible.</p>
          <Button onClick={() => window.location.href = '/api/login'}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation('/project-setup')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project Setup
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Make Your Project Visible</h1>
          <p className="text-gray-600">
            Pay $49 to make your project visible to VCs and get featured in our Scout marketplace. 
            This one-time payment includes:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
            <li>Project visibility to all verified VCs</li>
            <li>Featured placement in Scout marketplace</li>
            <li>Increased chances of getting discovered</li>
            <li>Analytics on VC views and interest</li>
          </ul>
        </div>

        <PaymentCheckout 
          type="project"
          onSuccess={() => {
            setLocation('/scout?success=true');
          }}
          onCancel={() => setLocation('/project-setup')}
        />
      </div>
    </div>
  );
}