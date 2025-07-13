import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ImprovedHeader } from "@/components/improved-header";
import { ColdInvestorCard } from "@/components/cold-investor-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function ColdScoutDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const storedEmail = localStorage.getItem('email_access_ping');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const { data: fundData, isLoading, error } = useQuery({
    queryKey: ["/api/cold-investors", slug],
    queryFn: async () => {
      const response = await fetch(`/api/cold-investors/${slug}`);
      if (!response.ok) {
        throw new Error('Fund not found');
      }
      return response.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-8">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !fundData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Fund Not Found</h1>
            <p className="text-gray-600 mb-6">
              The fund you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/ping">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scout
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { fund, decisionMakers } = fundData;

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/ping">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cold Scout
            </Link>
          </Button>
        </div>

        {/* Fund Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {fund.fundName}
              </h1>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  🔥 Cold Scout
                </span>
                {fund.website && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={fund.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {fund.investmentFocus && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Focus</h3>
              <p className="text-gray-600 leading-relaxed">
                {fund.investmentFocus}
              </p>
            </div>
          )}
        </div>

        {/* Decision Makers Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Decision Makers</h2>
            <p className="text-gray-600">
              Unlock contact information for key decision makers at {fund.fundName}. 
              Each unlock costs $1 and provides LinkedIn and Twitter profiles.
            </p>
          </div>

          <ColdInvestorCard 
            investor={fund}
            decisionMakers={decisionMakers}
            userEmail={userEmail}
          />
        </div>
      </div>
    </div>
  );
}