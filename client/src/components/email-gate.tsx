import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailGateProps {
  title: string;
  description: string;
  source: string;
  onSuccess: () => void;
}

export function EmailGate({ title, description, source, onSuccess }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Check if user has already provided email for this source
  useEffect(() => {
    const storedEmail = localStorage.getItem(`email_access_${source}`);
    if (storedEmail) {
      // Verify with backend that this email still has access
      apiRequest("GET", `/api/check-email-access?email=${encodeURIComponent(storedEmail)}&source=${source}`)
        .then(response => response.json())
        .then(data => {
          if (data.hasAccess) {
            onSuccess();
          } else {
            // Remove invalid stored email
            localStorage.removeItem(`email_access_${source}`);
          }
        })
        .catch(() => {
          // If check fails, remove stored email to be safe
          localStorage.removeItem(`email_access_${source}`);
        });
    }
  }, [source, onSuccess]);

  const submitEmailMutation = useMutation({
    mutationFn: async (emailData: { email: string; source: string }) => {
      const response = await apiRequest("POST", "/api/submit-email", emailData);
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      // Store email in localStorage for future visits
      localStorage.setItem(`email_access_${source}`, email);
      toast({
        title: "Access Granted",
        description: "Thank you! You now have access to this content.",
      });
      // Call onSuccess after a brief delay to show the success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    submitEmailMutation.mutate({ email: email.trim(), source });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-600">Access Granted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Thank you for providing your email. You'll be redirected to the content shortly.
            </p>
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-gray-600 mt-2">{description}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitEmailMutation.isPending}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={submitEmailMutation.isPending}
            >
              {submitEmailMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Get Access
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Your email will only be used to grant access to this content. We respect your privacy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}