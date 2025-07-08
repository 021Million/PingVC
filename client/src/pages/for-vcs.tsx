import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Users, DollarSign, Clock, Shield, Target, Zap } from "lucide-react";

export default function ForVCs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Ping Me</span>
              </a>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/"><a className="text-gray-700 hover:text-primary transition-colors">Home</a></Link>
              <Link href="/scout"><a className="text-gray-700 hover:text-primary transition-colors">Scout</a></Link>
              <Link href="/how-it-works"><a className="text-gray-700 hover:text-primary transition-colors">For Founders</a></Link>
              <span className="text-primary font-medium">For VCs</span>
              <Link href="/pricing"><a className="text-gray-700 hover:text-primary transition-colors">Pricing</a></Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">For Venture Capitalists</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with high-quality web3 founders while maintaining control over your time and pricing. Only engage with startups that are serious enough to pay for your attention.
          </p>
        </div>

        {/* How it Works for VCs */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Set up your profile and start receiving quality deal flow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Create Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Set up your fund profile with investment thesis, stages, sectors, and contact preferences. Set your own intro price.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>2. Get Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our team manually verifies your credentials to ensure only legitimate VCs appear on the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>3. Receive Quality Intros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Only founders serious enough to pay your intro fee will contact you. Get paid weekly for verified intros.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why VCs Love Ping Me</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Higher Quality Deal Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Founders who pay for intros are more serious and prepared. No more wasting time on unqualified pitches or cold outreach.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Monetize Your Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Set your own intro price and get compensated for the time you spend reviewing new opportunities. Weekly payouts via verified channels.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Control Your Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Choose between Telegram messages or scheduled meetings. Set your availability and preferred communication methods.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Web3 Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Exclusively focused on crypto and web3 startups. Connect with founders building the future of decentralized technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Control */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-8 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">You Set the Price</h2>
              <p className="text-xl text-primary-100 mb-6">
                Complete control over your intro pricing and contact preferences
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">Custom Pricing</div>
                  <p className="text-primary-100">Set your own intro price based on your time value</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">Telegram or Meetings</div>
                  <p className="text-primary-100">Choose your preferred contact method</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">Weekly Payouts</div>
                  <p className="text-primary-100">Get paid every week for verified intros</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scout Access */}
        <div className="mb-16">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-primary">Exclusive</Badge>
                <span className="text-sm text-gray-500">For Verified VCs</span>
              </div>
              <CardTitle className="text-2xl">Access to Scout Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get exclusive access to our Scout marketplace where founders showcase their projects. 
                Discover promising startups before they approach you, with community-validated metrics and traction data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">Early Discovery</div>
                  <p className="text-sm text-gray-600">Find startups before they reach out</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">Community Validation</div>
                  <p className="text-sm text-gray-600">See which projects get community votes</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">Rich Data</div>
                  <p className="text-sm text-gray-600">Traction metrics, team info, and more</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Ping Me?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join leading web3 VCs who are already using Ping Me to streamline their deal flow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/vc-signup">Create Your Profile <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="font-semibold text-gray-900">Ping Me</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/how-it-works"><a className="text-gray-600 hover:text-primary transition-colors">For Founders</a></Link>
              <Link href="/for-vcs"><a className="text-gray-600 hover:text-primary transition-colors">For VCs</a></Link>
              <Link href="/pricing"><a className="text-gray-600 hover:text-primary transition-colors">Pricing</a></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}