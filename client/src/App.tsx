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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/vc-signup" component={VCSignup} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/vc-signup" component={VCSignup} />
          <Route path="/admin" component={Admin} />
          <Route path="/payment-success/:paymentIntentId" component={PaymentSuccess} />
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
