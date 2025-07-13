import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Users, Building2, TrendingUp, Shield, CheckCircle, ArrowRight, Star } from "lucide-react";

export default function SignupType() {
  const handleFounderSignup = () => {
    localStorage.setItem('signup_type', 'founder');
    window.location.href = '/api/login?type=founder';
  };

  const handleVCSignup = () => {
    localStorage.setItem('signup_type', 'vc');
    window.location.href = '/api/login?type=vc';
  };

  const handleAngelSignup = () => {
    localStorage.setItem('signup_type', 'angel');
    window.location.href = '/api/login?type=angel';
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
            <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-200 group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-blue-50 rounded-bl-full"></div>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">I'm a Founder</CardTitle>
                <p className="text-gray-600">Looking to raise funding and connect with VCs & Angels</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Verified VCs & Angels</div>
                      <div className="text-gray-600">Filter by stage, sector, and investment focus</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Get Warm Introductions</div>
                      <div className="text-gray-600">Pay once to unlock contact info</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Scout Marketplace</div>
                      <div className="text-gray-600">Feature your project and get community votes</div>
                    </div>
                  </div>

                </div>
                
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-primary text-white group-hover:bg-primary/90 transition-colors"
                    onClick={handleFounderSignup}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Continue as Founder
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* VC Signup */}
            <Card className="relative overflow-hidden border-2 hover:border-green-200 transition-all duration-200 group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-bl-full"></div>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl mb-3">I'm a VC</CardTitle>
                <p className="text-gray-600">Get premium dealflow. Earn upside for your time</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Quality Dealflow</div>
                      <div className="text-gray-600">Pre-screened founders in your sectors</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Custom Pricing</div>
                      <div className="text-gray-600">Set your own intro fees (85% revenue share)</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Verified Profile</div>
                      <div className="text-gray-600">Get verified and build trust with founders</div>
                    </div>
                  </div>

                </div>
                
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                    onClick={handleVCSignup}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Apply as VC
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Subject to verification process
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Angel Investor Signup */}
            <Card className="relative overflow-hidden border-2 hover:border-purple-200 transition-all duration-200 group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-bl-full"></div>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Star className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl mb-3">I'm an Angel</CardTitle>
                <p className="text-gray-600">Individual investor looking for quality deals</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Curated Dealflow</div>
                      <div className="text-gray-600">Founders pay to connect, no time wasted</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Direct Founder Access</div>
                      <div className="text-gray-600">Connect directly with startup founders</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium">Scout Community</div>
                      <div className="text-gray-600">Vote on emerging projects and trends</div>
                    </div>
                  </div>

                </div>
                
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    onClick={handleAngelSignup}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Join as Angel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Subject to verification process
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Already have account */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/api/login'}
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