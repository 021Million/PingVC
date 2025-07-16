import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Target, Star, Trophy, Flame } from "lucide-react";

interface VCStatsDisplayProps {
  vcId: string;
  vcType: "airtable" | "platform";
  className?: string;
}

export function VCStatsDisplay({ vcId, vcType, className = "" }: VCStatsDisplayProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: [`/api/vc-stats/${vcId}/${vcType}`],
    enabled: !!vcId,
  });

  const { data: topVCs } = useQuery({
    queryKey: ["/api/top-vcs"],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate position in top VCs for progress bar
  const currentVCPosition = topVCs?.findIndex(
    (vc: any) => vc.vcId === vcId && vc.vcType === vcType
  ) + 1 || null;
  
  const isInTop3 = currentVCPosition && currentVCPosition <= 3;
  const progressToTop3 = currentVCPosition 
    ? Math.max(0, 100 - ((currentVCPosition - 1) / 2) * 100)
    : (stats.totalRequests / 10) * 100; // Rough estimate based on requests

  return (
    <Card className={`${className} border-l-4 ${isInTop3 ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-blue-500 bg-blue-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className={`h-5 w-5 ${isInTop3 ? 'text-yellow-600' : 'text-blue-600'}`} />
          Investor Popularity
          {isInTop3 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Trophy className="h-3 w-3 mr-1" />
              Top 3 VC
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Request Stats */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-blue-600">
            <Users className="h-6 w-6" />
            {stats.totalRequests}
          </div>
          <p className="text-sm text-gray-600 font-medium">Connection Requests (30d)</p>
          <p className="text-xs text-gray-500 mt-1">Shows investor popularity</p>
        </div>

        {/* Top Category */}
        {stats.topTag !== 'N/A' && (
          <div className="text-center">
            <Badge variant="outline" className="text-sm">
              <Target className="h-3 w-3 mr-1" />
              Top category: {stats.topTag}
            </Badge>
          </div>
        )}

        {/* Progress to Top 3 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {isInTop3 ? 'Top 3 VC Status' : 'Progress to Top 3'}
            </span>
            <span className="text-sm text-gray-600">
              {currentVCPosition ? `#${currentVCPosition}` : 'Unranked'}
            </span>
          </div>
          <Progress 
            value={Math.min(progressToTop3, 100)} 
            className={`h-2 ${isInTop3 ? 'bg-yellow-100' : 'bg-blue-100'}`}
          />
          {isInTop3 ? (
            <p className="text-xs text-yellow-700 font-medium">
              🎉 This investor is a Top 3 VC based on founder interest!
            </p>
          ) : (
            <p className="text-xs text-gray-600">
              {stats.totalRequests < 10 
                ? `${10 - stats.totalRequests} more requests needed to enter leaderboard`
                : `${currentVCPosition ? 3 - currentVCPosition : 'Several'} spots away from Top 3`
              }
            </p>
          )}
        </div>

        {/* Special Badges */}
        <div className="flex flex-wrap gap-2">
          {stats.openToAngel && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              ✅ Open to angel investments
            </Badge>
          )}
          {stats.donatesToCharity && (
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
              💖 Donates to founder charities
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}