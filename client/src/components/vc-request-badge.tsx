import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface VCRequestBadgeProps {
  vcId: string;
  vcType: 'airtable' | 'platform';
}

export function VCRequestBadge({ vcId, vcType }: VCRequestBadgeProps) {
  const { data: stats } = useQuery({
    queryKey: [`/api/vc-stats/${vcId}/${vcType}`],
    enabled: !!vcId && !!vcType,
  });

  if (!stats || stats.totalRequests === 0) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className="absolute top-3 right-3 bg-red-100 text-red-800 border-red-200 animate-pulse"
    >
      <Flame className="w-3 h-3 mr-1" />
      {stats.totalRequests} requests
    </Badge>
  );
}