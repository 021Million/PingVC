import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface VCGridCardProps {
  vc: any;
  type: "verified" | "platform" | "cold";
}

export function VCGridCard({ vc, type }: VCGridCardProps) {
  const name = vc.name || vc.partnerName || "Partner Name";
  const fund = vc.fund || vc.fundName || "Fund Name";
  const price = vc.price || vc.customPrice || null;
  const image = vc.Image?.[0]?.url || vc.logoUrl || null;
  const title = vc.title || vc.role || null;
  const verified = type === "verified" || vc.verified || vc.isVerified;
  
  // Generate link based on type
  const getLink = () => {
    if (type === "cold") {
      return `/cold-scout/${vc.fundSlug || vc.slug}`;
    }
    if (type === "verified") {
      return `/vc/${vc.id}`;
    }
    return `/vc/${vc.id}`;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
      <Link href={getLink()}>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {image ? (
                <img 
                  src={image} 
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {fund}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mb-2">
                    {name}
                    {title && (
                      <span className="text-gray-500"> • {title}</span>
                    )}
                  </p>
                </div>
                
                {verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {/* Tags */}
              {(vc.specialties || vc.sectors || vc['Primary Sector'] || vc['Investment Stage']) && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(vc.specialties || vc.sectors || (vc['Primary Sector'] ? [vc['Primary Sector']] : []) || []).slice(0, 3).map((specialty: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                      {specialty}
                    </Badge>
                  ))}
                  {vc['Investment Stage'] && (
                    <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700">
                      {Array.isArray(vc['Investment Stage']) ? vc['Investment Stage'][0] : vc['Investment Stage']}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Price */}
              <div className="flex items-center justify-between">
                {price && (
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    {typeof price === 'number' ? `$${price}` : `${price}`}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                  <span className="mr-1">View Profile</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
}