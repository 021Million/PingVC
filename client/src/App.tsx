import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import VCSignup from "@/pages/vc-signup";
import Admin from "@/pages/admin";
import PaymentSuccess from "@/pages/payment-success";
import ProfileSetup from "@/pages/profile-setup";
import ProjectSetup from "@/pages/project-setup";
import Profile from "@/pages/profile";
import Scout from "@/pages/scout";
import HowItWorks from "@/pages/how-it-works";
import ForVCs from "@/pages/for-vcs";
import Pricing from "@/pages/pricing";
import Join from "@/pages/join";
import SignupType from "@/pages/signup-type";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Support from "@/pages/support";
import ProjectVisibilityPayment from "@/pages/project-visibility-payment";


function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show profile setup if user is authenticated but hasn't completed profile
  if (isAuthenticated && user && !(user as any).profileCompleted) {
    return <ProfileSetup />;
  }

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/vc-signup" component={VCSignup} />
          <Route path="/scout" component={Scout} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/for-vcs" component={ForVCs} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/join" component={Join} />
          <Route path="/signup" component={SignupType} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/support" component={Support} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/vc-signup" component={VCSignup} />
          <Route path="/admin" component={Admin} />
          <Route path="/payment-success/:paymentIntentId" component={PaymentSuccess} />
          <Route path="/project-setup" component={ProjectSetup} />
          <Route path="/profile" component={Profile} />
          <Route path="/scout" component={Scout} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/for-vcs" component={ForVCs} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/join" component={Join} />
          <Route path="/signup" component={SignupType} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/support" component={Support} />
          <Route path="/project-payment" component={ProjectVisibilityPayment} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
