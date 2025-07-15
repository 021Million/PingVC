import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function EmailCaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already captured email in this session
    const hasCapture = sessionStorage.getItem('pingVCEarly');
    
    if (!hasCapture) {
      // Show modal after 2 seconds delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest('POST', '/api/newsletter-signup', { email, source: 'early_access' });
      
      // Mark as captured in session storage
      sessionStorage.setItem('pingVCEarly', 'true');
      
      setIsOpen(false);
      
      toast({
        title: "Welcome to Ping VC!",
        description: "You're in! Get ready for exclusive early bird deals and VC insights.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or check your email format.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Mark as seen so it doesn't show again this session
    sessionStorage.setItem('pingVCEarly', 'seen');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 border-yellow-300"
            >
              <Gift className="h-3 w-3 mr-1" />
              Early Bird
            </Badge>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            🚀 Join Ping VC Early
          </DialogTitle>
          
          <p className="text-gray-600 leading-relaxed">Get exclusive early bird deals, priority access to top VCs, and insider founder insights. Join our early access list today.</p>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-center text-base"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Joining...
                </div>
              ) : (
                <>
                  Get Early Bird Access
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm">What you'll get:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>💰 Exclusive early bird pricing on VC connections</li>
              <li>🚀 Priority access to top-tier investors</li>
              <li>📊 Weekly VC market insights and trends</li>
              <li>💎 First access to new investor profiles</li>
            </ul>
          </div>

          {/* GDPR Compliance */}
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            By submitting, you agree to receive emails from Ping VC. 
            You can unsubscribe anytime.
          </p>

          {/* Close button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClose}
            className="w-full text-gray-500 hover:text-gray-700"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}