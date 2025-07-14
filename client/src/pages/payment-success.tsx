import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PaymentSuccess() {
  const { paymentIntentId } = useParams() as { paymentIntentId: string };
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<any>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/confirm-payment", { paymentIntentId });
    },
    onSuccess: (response) => {
      const data = response.json();
      setPaymentData(data);
      toast({
        title: "Payment Confirmed!",
        description: "Your VC contact has been unlocked successfully.",
      });
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
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isAuthenticated && paymentIntentId && !paymentData) {
      confirmPaymentMutation.mutate();
    }
  }, [isAuthenticated, paymentIntentId, paymentData]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (isLoading || confirmPaymentMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Processing payment confirmation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { vc, introTemplate } = paymentData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ping VC</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="text-gray-700 hover:text-primary font-medium"
              >
                Browse More VCs
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-700 hover:text-primary font-medium"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Unlocked!</h2>
            <p className="text-lg text-gray-600">Your intro to {vc.fundName} is ready</p>
          </div>
          
          {/* Contact Information */}
          <Card className="border-2 border-gray-200 mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Direct Contact</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-1">
                  {vc.contactType === 'telegram' ? 'Telegram Handle' : 'Meeting Link'}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg">{vc.contactHandle}</span>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(vc.contactHandle, vc.contactType === 'telegram' ? 'Telegram handle' : 'Meeting link')}
                    className="bg-primary text-white hover:bg-indigo-700"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              
              {vc.contactType === 'telegram' ? (
                <Button
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => window.open(`https://t.me/${vc.contactHandle.replace('@', '')}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Telegram
                </Button>
              ) : (
                <Button
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => window.open(vc.contactHandle, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Meeting Link
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* AI-Generated Intro Template */}
          <Card className="border-2 border-gray-200 mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">AI-Generated Intro Template</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <Textarea
                  value={introTemplate}
                  readOnly
                  rows={8}
                  className="text-sm text-gray-700 bg-transparent border-none resize-none focus:outline-none"
                />
              </div>
              <Button
                onClick={() => copyToClipboard(introTemplate, 'Intro template')}
                className="w-full bg-primary text-white hover:bg-indigo-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Template
              </Button>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="text-center space-y-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="px-6 py-3"
            >
              Browse More VCs
            </Button>
            <p className="text-sm text-gray-500">
              Need help? Contact us at support@pingme.xyz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
