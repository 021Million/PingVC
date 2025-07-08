import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Check, DollarSign, Users, Zap, Star } from "lucide-react";

export default function Pricing() {
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
              <Link href="/"><a className="text-gray-700 hover:text-primary transition-colors">VCs</a></Link>
              <Link href="/scout"><a className="text-gray-700 hover:text-primary transition-colors">Scout</a></Link>
              <Link href="/how-it-works"><a className="text-gray-700 hover:text-primary transition-colors">How it Works</a></Link>
              <Link href="/for-vcs"><a className="text-gray-700 hover:text-primary transition-colors">For VCs</a></Link>
              <span className="text-primary font-medium">Pricing</span>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pay only for what you use. VCs set their own intro prices, and you pay directly for access to their contact information.
          </p>
        </div>

        {/* For Founders */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Founders</h2>
            <p className="text-lg text-gray-600">Pay per VC intro - no subscriptions, no hidden fees</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Access */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Browse VCs</CardTitle>
                <div className="text-3xl font-bold text-gray-900">Free</div>
                <p className="text-gray-600">Browse our verified VC database</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">View all VC profiles</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Filter by stage & sector</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">See intro prices</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Access Scout marketplace</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link href="/">Start Browsing</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Per Intro */}
            <Card className="border-primary/50 shadow-lg scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">VC Introductions</CardTitle>
                  <Badge className="bg-primary">Popular</Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900">$25 - $500+</div>
                <p className="text-gray-600">Per VC intro (price set by each VC)</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Instant contact access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">AI-generated intro template</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Telegram or meeting link</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Direct access guarantee</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link href="/">Browse VCs <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            {/* Scout Features */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Scout Features</CardTitle>
                <div className="text-3xl font-bold text-gray-900">$99 - $299</div>
                <p className="text-gray-600">Per featured project (1-4 weeks)</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Featured placement</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Priority in VC feeds</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Analytics dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Community visibility boost</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link href="/scout">View Scout</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* For VCs */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For VCs</h2>
            <p className="text-lg text-gray-600">Set your own prices and get paid for quality introductions</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Complete Control</CardTitle>
                <p className="text-gray-600 text-lg">Set your intro price and contact preferences</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">What You Control:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>Your intro price ($25 - $500+)</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>Contact method (Telegram/Meeting)</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>Investment thesis visibility</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>Profile verification status</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">What You Get:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>Weekly payouts (95% of intro fees)</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>Higher quality deal flow</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>Scout marketplace access</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>Analytics and insights</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <Button size="lg" asChild>
                    <Link href="/vc-signup">Join as VC <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Examples */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Pricing Examples</h2>
            <p className="text-lg text-gray-600">See what different VCs charge for introductions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Badge variant="outline" className="mx-auto mb-2">Seed Stage</Badge>
                <CardTitle>Early Stage Partners</CardTitle>
                <div className="text-2xl font-bold text-primary">$25 - $75</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Partners at seed-focused funds who are actively looking for new deals in their thesis areas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/50">
              <CardHeader>
                <Badge className="mx-auto mb-2">Series A+</Badge>
                <CardTitle>Growth Stage VCs</CardTitle>
                <div className="text-2xl font-bold text-primary">$100 - $250</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Established partners at top-tier funds with specific sector expertise and track records.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Badge variant="outline" className="mx-auto mb-2">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
                <CardTitle>Top Tier Partners</CardTitle>
                <div className="text-2xl font-bold text-primary">$300 - $500+</div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Leading partners at flagship funds with limited availability and high-value connections.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do VCs get paid?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  VCs receive 95% of their intro fee weekly via verified payment methods. We retain 5% as a platform fee to cover operations and verification costs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if a VC doesn't respond?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  While we can't guarantee responses, all VCs are verified and have committed to the platform. We provide their preferred contact method (Telegram or meeting link) for direct access.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I get refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We process refunds if a VC's contact information is incorrect or if they're no longer active. Contact our support team within 7 days of purchase.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does Scout featuring work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Scout featuring places your project at the top of our marketplace for 1-4 weeks depending on the package. Featured projects get 10x more visibility from our VC network.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of founders and VCs who are already using Ping Me to make better connections
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">Browse VCs <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/vc-signup">Join as VC</Link>
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