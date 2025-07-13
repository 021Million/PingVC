import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { Link } from "wouter";

interface ColdInvestor {
  id: number;
  fundName: string;
  fundSlug: string;
  website?: string;
  investmentFocus?: string;
}

interface ColdInvestorPreviewCardProps {
  investor: ColdInvestor;
}

export function ColdInvestorPreviewCard({ investor }: ColdInvestorPreviewCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              {investor.fundName}
            </CardTitle>
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
              🔥 Cold Scout
            </Badge>
          </div>
          {investor.website && (
            <Button size="sm" variant="ghost" asChild>
              <a href={investor.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {investor.investmentFocus && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {investor.investmentFocus}
          </p>
        )}
        
        <div className="pt-2">
          <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            <Link href={`/cold-scout/${investor.fundSlug}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}