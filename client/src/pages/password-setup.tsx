import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PasswordSetup } from "@/components/password-setup";

export default function PasswordSetupPage() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const handleComplete = () => {
    // Redirect to profile or home page after password setup
    setLocation("/profile");
  };

  // If user already has password set, redirect to settings
  if (user?.hasSetPassword) {
    setLocation("/settings");
    return null;
  }

  return <PasswordSetup onComplete={handleComplete} />;
}