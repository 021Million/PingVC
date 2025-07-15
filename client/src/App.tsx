import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import VCSignup from "@/pages/vc-signup";
import Admin from "@/pages/admin";
import PaymentSuccess from "@/pages/payment-success";
import ProfileSetup from "@/pages/profile-setup";
import ProjectSetup from "@/pages/project-setup";
import Profile from "@/pages/profile";

import Ping from "@/pages/ping";
import VCs from "@/pages/vcs";
import Directory from "@/pages/directory";

import Join from "@/pages/join";
import SignupType from "@/pages/signup-type";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Support from "@/pages/support";
import ProjectVisibilityPayment from "@/pages/project-visibility-payment";
import ProjectDetails from "@/pages/project-details";
import VCDetails from "@/pages/vc-details";
import Settings from "@/pages/settings";
import PasswordSetupPage from "@/pages/password-setup";
import ColdScoutDetail from "@/pages/cold-scout-detail";
import { VCDetailPage } from "@/pages/vc-detail";
import Auth from "@/pages/auth";
import RequestsPage from "@/pages/requests";
import AirtableVCDetail from "@/pages/airtable-vc-detail";
import ScoutSuccess from "@/pages/scout-success";
import Scout from "@/pages/scout";



function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show profile setup if user is authenticated but hasn't completed profile
  if (isAuthenticated && user && !(user as any).profileCompleted) {
    return <ProfileSetup />;
  }

  // Show password setup if user is authenticated, profile completed, but no password set
  if (isAuthenticated && user && (user as any).profileCompleted && !(user as any).hasSetPassword) {
    return <PasswordSetupPage />;
  }

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/vc-signup" component={VCSignup} />
          <Route path="/ping" component={Ping} />
          <Route path="/vcs" component={VCs} />
          <Route path="/directory" component={Directory} />
          <Route path="/vc/:id" component={VCDetailPage} />
          <Route path="/auth" component={Auth} />
          <Route path="/join" component={Join} />
          <Route path="/signup" component={SignupType} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/support" component={Support} />
          <Route path="/requests" component={RequestsPage} />
          <Route path="/investor/:id" component={AirtableVCDetail} />
          <Route path="/project/:id" component={ProjectDetails} />
          <Route path="/scout-success" component={ScoutSuccess} />
          <Route path="/scout" component={Scout} />
          <Route path="/cold-scout/:slug" component={ColdScoutDetail} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/vc-signup" component={VCSignup} />
          <Route path="/admin" component={Admin} />
          <Route path="/payment-success/:paymentIntentId" component={PaymentSuccess} />
          <Route path="/project-setup" component={ProjectSetup} />
          <Route path="/scout-success" component={ScoutSuccess} />
          <Route path="/scout" component={Scout} />
          <Route path="/profile" component={Profile} />
          <Route path="/ping" component={Ping} />
          <Route path="/vcs" component={VCs} />
          <Route path="/directory" component={Directory} />
          <Route path="/vc/:id" component={VCDetailPage} />
          <Route path="/auth" component={Auth} />
          <Route path="/project/:id" component={ProjectDetails} />
          <Route path="/join" component={Join} />
          <Route path="/signup" component={SignupType} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/support" component={Support} />
          <Route path="/requests" component={RequestsPage} />
          <Route path="/project-payment" component={ProjectVisibilityPayment} />
          <Route path="/settings" component={Settings} />
          <Route path="/password-setup" component={PasswordSetupPage} />
          <Route path="/investor/:id" component={AirtableVCDetail} />
          <Route path="/cold-scout/:slug" component={ColdScoutDetail} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
