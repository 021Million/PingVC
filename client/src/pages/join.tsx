import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Users, Building2, TrendingUp, Shield, Zap, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Join() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Join the <span className="text-primary">Ping Me</span> Community
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect, invest, and grow with the most active community of founders and venture capitalists in Web3
            </p>
          </div>

          {/* Two Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Join as Founder */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-colors group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-blue-50 rounded-bl-full"></div>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">Join as Founder</CardTitle>
                <p className="text-gray-600">Get warm introductions to VCs who actually invest in your sector</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Browse Verified VCs</div>
                      <div className="text-sm text-gray-600">Access curated list of active investors</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Warm Introductions</div>
                      <div className="text-sm text-gray-600">Get customized intro templates powered by AI</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Scout Marketplace</div>
                      <div className="text-sm text-gray-600">Feature your project and get community votes</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Direct Connect</div>
                      <div className="text-sm text-gray-600">No cold emails, guaranteed response</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-primary text-white group-hover:bg-primary/90 transition-colors"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Join as Founder
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Start browsing VCs immediately after signup
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Join as VC */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-colors group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-bl-full"></div>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl mb-2">Join as VC</CardTitle>
                <p className="text-gray-600">Receive high-quality dealflow and earn from introductions</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Quality Dealflow</div>
                      <div className="text-sm text-gray-600">Pre-screened founders in your investment focus</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Set Your Price</div>
                      <div className="text-sm text-gray-600">Custom pricing for intro fees (85% revenue share)</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Verified Profile</div>
                      <div className="text-sm text-gray-600">Admin verification and trusted badge</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Control Your Flow</div>
                      <div className="text-sm text-gray-600">Set weekly intro limits and preferences</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Link href="/vc-signup">
                    <Button 
                      size="lg" 
                      className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Apply as VC
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Subject to verification before going live
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-lg p-8 shadow-sm border max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Already have an account?
              </h3>
              <p className="text-gray-600 mb-6">
                Sign in to access your dashboard and continue where you left off
              </p>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}