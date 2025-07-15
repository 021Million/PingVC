import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/header";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

export default function ScoutSuccess() {
  const [location] = useLocation();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // Verify payment and publish project
      fetch(`/api/scout-payment-success?session_id=${sessionId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setSuccess(true);
            // Trigger confetti animation
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
            
            toast({
              title: "Project Published!",
              description: "Your project is now live on the Scout marketplace!",
            });
          } else {
            toast({
              title: "Error",
              description: "Failed to publish project. Please contact support.",
              variant: "destructive",
            });
          }
        })
        .catch(error => {
          console.error('Error verifying payment:', error);
          toast({
            title: "Error",
            description: "Failed to verify payment. Please contact support.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      toast({
        title: "Error",
        description: "No payment session found.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {loading ? (
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              ) : success ? (
                <CheckCircle className="h-16 w-16 text-green-600" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-2xl">✗</span>
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {loading ? "Processing Your Payment..." : success ? "Project Published Successfully!" : "Payment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <p className="text-gray-600">
                We're verifying your payment and publishing your project to the Scout marketplace. 
                This should only take a moment...
              </p>
            ) : success ? (
              <>
                <p className="text-gray-600">
                  Congratulations! Your project has been successfully published to the Scout marketplace. 
                  Investors and the community can now discover your startup.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">What happens next?</h4>
                  <ul className="text-green-800 text-sm space-y-1 text-left">
                    <li>• Your project is now visible on the Scout marketplace</li>
                    <li>• Community members can vote for your project</li>
                    <li>• Higher-voted projects get more visibility to VCs</li>
                    <li>• Investors can discover and contact you directly</li>
                  </ul>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/scout">View Scout Marketplace</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600">
                  We encountered an issue processing your payment or publishing your project. 
                  Please contact our support team for assistance.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/project-setup">Try Again</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/support">Contact Support</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}