import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, Users, Target, TrendingUp } from "lucide-react";

interface AirtableVCPreviewCardProps {
  vc: any;
}

export function AirtableVCPreviewCard({ vc }: AirtableVCPreviewCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/vc/${vc.id}`);
  };

  return (
    <Card 
      className="h-full hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]" 
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {vc.Image && Array.isArray(vc.Image) && vc.Image.length > 0 ? (
              <img 
                src={vc.Image[0].url} 
                alt={vc.name || "Investor"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg font-medium">
                  {(vc.name || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {vc.fund || "Fund Name"}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {vc.name || "Partner Name"}
              {vc.title && (
                <span className="text-gray-500"> • {vc.title}</span>
              )}
            </p>
          </div>
          
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0">
            <Shield className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Investment Details */}
        <div className="space-y-2">
          {(vc['Investment Stage'] || vc.stage) && (
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              {Array.isArray(vc['Investment Stage']) ? vc['Investment Stage'].join(", ") : (vc['Investment Stage'] || vc.stage)}
            </div>
          )}
          {vc['Primary Sector'] && (
            <div className="flex items-center text-sm text-gray-600">
              <Target className="h-4 w-4 mr-2" />
              {(() => {
                const sectors = vc['Primary Sector'];
                if (Array.isArray(sectors)) {
                  return sectors.slice(0, 2).join(", ") + (sectors.length > 2 ? ` +${sectors.length - 2} more` : "");
                }
                return sectors;
              })()}
            </div>
          )}
          {vc.price && (
            <div className="flex items-center text-sm text-gray-600">
              Unlock for ${vc.price}
            </div>
          )}
          {vc.limit && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              Limit: {vc.limit}/month
            </div>
          )}
        </div>

        {/* Investment Thesis Preview */}
        {vc['Investment Thesis'] && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700">Investment Focus</h4>
            <p className="text-sm text-gray-600 line-clamp-3">
              {vc['Investment Thesis']}
            </p>
          </div>
        )}

        {/* Bio Preview */}
        {vc.bio && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-700">About</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {vc.bio}
            </p>
          </div>
        )}

        {/* Book Now Button */}
        <div className="pt-4 border-t">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = '/vcs';
            }}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}