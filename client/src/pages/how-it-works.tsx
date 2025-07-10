import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Search, CreditCard, MessageSquare, Users, TrendingUp, Shield } from "lucide-react";

export default function HowItWorks() {
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
              <span className="text-primary font-medium">For Founders</span>
              <Link href="/for-vcs"><a className="text-gray-700 hover:text-primary transition-colors">For VCs</a></Link>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How Ping Me Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">The simplest way for Web3 founders to connect with the right VCs and Angels. No cold outreach, no waiting, just direct access to decision makers.</p>
        </div>

        {/* For Founders */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Founders</h2>
            <p className="text-lg text-gray-600">Get warm introductions to VCs who actually invest in your space</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Browse VCs & Angels</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Filter through our verified network of Web3 VCs & Angels by stage, sector, and investment focus. Each individual sets their own intro price.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>2. Pay for Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Pay the set price to unlock their contact details and receive a personalized intro template powered by AI.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>3. Connect Directly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Reach out via Telegram or schedule a meeting using the contact method they prefer. No middlemen, no gatekeepers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scout Marketplace */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-8 text-white mb-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Scout Marketplace</h2>
              <p className="text-xl text-primary-100 mb-6">
                Showcase your project to the community and get discovered by VCs
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary-200" />
                  <h3 className="text-lg font-semibold mb-2">Community Voting</h3>
                  <p className="text-primary-100">Get upvotes from fellow founders and investors</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary-200" />
                  <h3 className="text-lg font-semibold mb-2">Featured Projects</h3>
                  <p className="text-primary-100">Pay to get premium visibility to our VC network</p>
                </div>
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary-200" />
                  <h3 className="text-lg font-semibold mb-2">Quality Control</h3>
                  <p className="text-primary-100">Only serious projects with real traction get featured</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Founders Choose Ping Me</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">✓</span>
              </div>
              <h3 className="font-semibold mb-2">Verified VCs Only</h3>
              <p className="text-gray-600 text-sm">Every VC is manually verified by our team</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">$</span>
              </div>
              <h3 className="font-semibold mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 text-sm">VCs set their own prices, no hidden fees</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Instant Access</h3>
              <p className="text-gray-600 text-sm">Get contact details immediately after payment</p>
            </div>


          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Connect with VCs?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of web3 founders who have successfully raised funding through Ping Me
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">Browse VCs <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/scout">Explore Scout</Link>
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
              <Link href="/how-it-works"><a className="text-gray-600 hover:text-primary transition-colors">How it Works</a></Link>
              <Link href="/for-vcs"><a className="text-gray-600 hover:text-primary transition-colors">For VCs</a></Link>
              <Link href="/pricing"><a className="text-gray-600 hover:text-primary transition-colors">Pricing</a></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}