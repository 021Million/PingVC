import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, Users, Star } from "lucide-react";

export function TopVCsLeaderboard() {
  const { data: topVCs, isLoading } = useQuery({
    queryKey: ["/api/top-vcs"],
  });

  const { data: airtableData } = useQuery({
    queryKey: ["/api/airtable/vcs"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Top 3 VCs Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topVCs || topVCs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Top 3 VCs Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">
            No VC requests yet. Be the first to unlock and rank!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getVCDetails = (vcId: string, vcType: string) => {
    if (vcType === 'airtable') {
      const allVCs = [
        ...(airtableData?.verifiedVCs || []),
        ...(airtableData?.unverifiedVCs || [])
      ];
      return allVCs.find((vc: any) => vc.id === vcId);
    }
    // For platform VCs, you'd fetch from your platform VC data
    return null;
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-500" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{position}</span>;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const top3VCs = topVCs.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Top 3 VCs Leaderboard
          <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
            <TrendingUp className="h-3 w-3 mr-1" />
            Live Rankings
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on founder demand signals in the last 30 days
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {top3VCs.map((vc: any, index: number) => {
          const position = index + 1;
          const vcDetails = getVCDetails(vc.vcId, vc.vcType);
          const vcName = vcDetails?.fund || vcDetails?.fundName || `VC ${vc.vcId}`;
          const partnerName = vcDetails?.name || vcDetails?.partnerName;

          return (
            <div
              key={`${vc.vcId}-${vc.vcType}`}
              className={`p-4 rounded-lg border-2 ${getRankColor(position)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(position)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{vcName}</h4>
                    {partnerName && (
                      <p className="text-sm text-gray-600">{partnerName}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{vc.requests}</span>
                      <span className="text-gray-500">requests</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <Star className="h-4 w-4" />
                      <span className="font-medium">{vc.avgScore}</span>
                      <span className="text-gray-500">score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {topVCs.length > 3 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 text-center">
              +{topVCs.length - 3} more VCs in the full leaderboard
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}