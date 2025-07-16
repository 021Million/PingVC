import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ListProjectButtonProps {
  variant?: "default" | "floating" | "large";
  className?: string;
}

export function ListProjectButton({ variant = "default", className = "" }: ListProjectButtonProps) {
  const { user, isAuthenticated } = useAuth();

  // Don't show button for VCs and Angels
  if (user && (user.userType === 'vc' || user.userType === 'angel')) {
    return null;
  }

  const getButtonContent = () => {
    switch (variant) {
      case "floating":
        return (
          <Button 
            size="lg" 
            className={`fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white px-6 py-6 ${className}`}
            asChild
          >
            <Link href={isAuthenticated ? "/project-setup" : "/auth"}>
              <Plus className="h-6 w-6 mr-2" />
              List Project
            </Link>
          </Button>
        );
      case "large":
        return (
          <Button 
            size="lg" 
            className={`bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold ${className}`}
            asChild
          >
            <Link href={isAuthenticated ? "/project-setup" : "/auth"}>
              List Project Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        );
      default:
        return (
          <Button 
            size="default" 
            className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
            asChild
          >
            <Link href={isAuthenticated ? "/project-setup" : "/auth"}>
              <Plus className="h-4 w-4 mr-2" />
              List Project
            </Link>
          </Button>
        );
    }
  };

  return getButtonContent();
}