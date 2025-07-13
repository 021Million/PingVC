import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowUp, Trophy, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface MarketplaceLandingProps {
  vcs: any[];
  projects: any[];
}

export function MarketplaceLanding({ vcs, projects }: MarketplaceLandingProps) {
  // Fetch top 3 projects from Scout
  const { data: topProjects = [] } = useQuery({
    queryKey: ['/api/scout/featured'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const rankBadges = ["1st", "2nd", "3rd"];
  const rankIcons = [
    <Trophy className="h-6 w-6 text-yellow-500" />,
    <Trophy className="h-6 w-6 text-gray-400" />,
    <Trophy className="h-6 w-6 text-amber-600" />
  ];
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Projects Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                Top Community Projects
              </h2>
              <p className="text-gray-600">Most upvoted projects from our Scout marketplace</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/scout">View All Projects <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProjects.slice(0, 3).map((project: any, index: number) => (
              <Card key={project.id} className="group hover:shadow-lg transition-shadow border-2 border-primary/20 bg-gradient-to-br from-yellow-50 to-orange-50 relative cursor-pointer"
                    onClick={() => window.location.href = `/project/${project.id}`}>
                {/* Ranking badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-red-500 text-white font-bold">
                    🏆 {rankBadges[index]}
                  </Badge>
                </div>
                
                <CardHeader className="pb-3 pt-12">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {rankIcons[index]}
                      <div>
                        <CardTitle className="text-lg">{project.companyName || "Stealth Startup"}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{project.ecosystem || "Multi-chain"}</Badge>
                          <Badge variant="outline" className="text-xs">{project.vertical || "General"}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border">
                      <ArrowUp className="h-4 w-4 text-primary" />
                      <span className="font-bold text-lg">{project.voteCount || 0}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.traction && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {project.traction}
                      </p>
                    )}
                    {project.amountRaising && (
                      <div className="text-sm text-gray-500">
                        Raising: ${(project.amountRaising / 1000000).toFixed(1)}M
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Community favorite</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/project/${project.id}`;
                      }}>
                        View Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Show fallback if no top projects */}
            {topProjects.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No projects yet. Be the first to submit!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}