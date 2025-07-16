import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Building2, TrendingUp, Star } from "lucide-react";

export default function SignupType() {
  const handleFounderSignup = () => {
    localStorage.setItem('signup_type', 'founder');
    window.location.href = '/auth?defaultType=founder';
  };

  const handleVCSignup = () => {
    localStorage.setItem('signup_type', 'vc');
    window.location.href = '/auth?defaultType=vc';
  };

  const handleAngelSignup = () => {
    localStorage.setItem('signup_type', 'angel');
    window.location.href = '/auth?defaultType=angel';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How will you use <span className="text-primary">Ping Me</span>?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your path to get started with the right features for your needs
            </p>
          </div>

          {/* Three Options */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Founder Signup */}
            <Card 
              className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
              onClick={handleFounderSignup}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-blue-50 rounded-bl-full"></div>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">I'm a Founder</CardTitle>
              </CardHeader>
            </Card>

            {/* VC Signup */}
            <Card 
              className="relative overflow-hidden border-2 hover:border-green-200 transition-all duration-200 group cursor-pointer"
              onClick={handleVCSignup}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-bl-full"></div>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl mb-3">I'm a VC</CardTitle>
              </CardHeader>
            </Card>

            {/* Angel Investor Signup */}
            <Card 
              className="relative overflow-hidden border-2 hover:border-purple-200 transition-all duration-200 group cursor-pointer"
              onClick={handleAngelSignup}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-bl-full"></div>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Star className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl mb-3">I'm an Angel</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Already have account */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/auth'}
              className="border-gray-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}