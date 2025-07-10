import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, TrendingUp, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface MarketplaceLandingProps {
  vcs: any[];
  projects: any[];
}

export function MarketplaceLanding({ vcs, projects }: MarketplaceLandingProps) {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Projects Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Projects</h2>
              <p className="text-gray-600">Promising startups looking for investment</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/scout">View Scout <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => (
              <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.companyName}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{project.votes || 0}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {project.ecosystem}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {project.vertical}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                    {project.amountRaising && (
                      <div className="text-sm text-gray-500">
                        Raising: ${project.amountRaising.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Community vote</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}