import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ListProjectButtonProps {
  variant?: "default" | "floating" | "large";
  className?: string;
}

export function ListProjectButton({ variant = "default", className = "" }: ListProjectButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Don't show button for VCs and Angels
  if (user && (user.userType === 'vc' || user.userType === 'angel')) {
    return null;
  }

  const handleClick = () => {
    setLocation(isAuthenticated ? "/project-setup" : "/auth");
  };

  const getButtonContent = () => {
    switch (variant) {
      case "floating":
        return (
          <Button 
            size="lg" 
            className={`fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white px-6 py-6 ${className}`}
            onClick={handleClick}
          >
            <Plus className="h-6 w-6 mr-2" />
            List Project
          </Button>
        );
      
      default:
        return (
          <Button 
            size="default" 
            className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
            onClick={handleClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            List Project
          </Button>
        );
    }
  };

  return getButtonContent();
}