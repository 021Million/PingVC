import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, MessageCircle, Mail, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface RequestCallModalProps {
  vc: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestCallModal({ vc, isOpen, onClose, onSuccess }: RequestCallModalProps) {
  const [founderName, setFounderName] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const requestMutation = useMutation({
    mutationFn: async (data: { vcId: string; founderEmail: string; founderName: string; message: string }) => {
      const response = await apiRequest("POST", "/api/request-call", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request sent successfully!",
        description: `Our team will reach out to Curtis Spencer privately to try facilitate the introduction.`,
      });
      onSuccess?.();
      onClose();
      // Reset form
      setFounderName("");
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Failed to send request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send introduction requests.",
        variant: "destructive",
      });
      return;
    }

    if (!founderName) {
      toast({
        title: "Missing information",
        description: "Please provide your name.",
        variant: "destructive",
      });
      return;
    }

    // Track VC request for gamification
    try {
      await apiRequest("POST", "/api/vc-request", {
        vcId: vc.id,
        vcType: 'airtable',
        founderEmail: user.email,
        founderScore: 65, // Default score for manual requests
        tags: vc['Investment Stage'] ? [vc['Investment Stage']] : ['General'],
        requestType: 'booking_request',
      });
    } catch (error) {
      console.error("Error tracking VC request:", error);
    }

    requestMutation.mutate({
      vcId: vc.id,
      founderEmail: user.email,
      founderName,
      message,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-600" />
            Request Introduction to {vc.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Warning Card */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-800">
                    Unverified Investor
                  </p>
                  <p className="text-sm text-orange-700">This investor hasn't been verified by our team yet. We'll try to facilitate the introduction manually and reach out to them about joining our platform.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VC Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {vc.Image && Array.isArray(vc.Image) && vc.Image.length > 0 ? (
                <img 
                  src={vc.Image[0].url} 
                  alt={vc.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                  <span className="text-orange-800 text-lg font-medium">
                    {vc.name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{vc.name}</h3>
                <p className="text-sm text-gray-600">{vc.fund}</p>
                {vc.title && <p className="text-xs text-gray-500">{vc.title}</p>}
              </div>
            </div>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="founderName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Name *
                </Label>
                <Input
                  id="founderName"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  placeholder="Elon Musk"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Your Email
                </Label>
                <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm text-gray-700">
                  {user?.email || "Not signed in"}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">
                Introduction Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the investor about your startup, what you're building, and why you'd like to connect..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={requestMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {requestMutation.isPending ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}