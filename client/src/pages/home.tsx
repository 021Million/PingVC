import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterSection } from "@/components/filter-section";
import { VCCard } from "@/components/vc-card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [stageFilter, setStageFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("");

  const { data: vcs = [], isLoading } = useQuery({
    queryKey: ["/api/vcs", { stage: stageFilter, sector: sectorFilter, verified: true }],
  });

  const { data: myUnlocks = [] } = useQuery({
    queryKey: ["/api/my-unlocks"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ping Me</span>
            </a>
            
            <nav className="hidden md:flex items-center space-x-8">
              <span className="text-primary font-medium">VCs</span>
              <Link href="/scout" className="text-gray-700 hover:text-primary transition-colors">Scout</Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-primary transition-colors">How it Works</Link>
              <Link href="/for-vcs" className="text-gray-700 hover:text-primary transition-colors">For VCs</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary transition-colors">Pricing</Link>
              <Link href="/vc-signup" className="text-gray-700 hover:text-primary transition-colors">List as VC</Link>
              {user?.isAdmin && (
                <Link href="/admin" className="text-gray-700 hover:text-primary transition-colors">Admin</Link>
              )}
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <Link href="/profile" className="text-primary hover:underline">{user?.firstName || user?.email}</Link>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-700 hover:text-primary font-medium"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* My Unlocks Section */}
      {myUnlocks.length > 0 && (
        <section className="bg-white py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Unlocked VCs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myUnlocks.slice(0, 3).map((unlock: any) => (
                <Card key={unlock.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {unlock.fundName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{unlock.fundName}</h3>
                        <p className="text-sm text-gray-600">{unlock.partnerName}</p>
                      </div>
                      <div className="text-sm font-mono text-gray-700">
                        {unlock.contactType === 'telegram' ? `@${unlock.contactHandle.replace('@', '')}` : '📅 Meeting'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {myUnlocks.length > 3 && (
              <Button variant="outline" className="mt-4">
                View All ({myUnlocks.length})
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Filter Section */}
      <FilterSection 
        stageFilter={stageFilter}
        sectorFilter={sectorFilter}
        onStageChange={setStageFilter}
        onSectorChange={setSectorFilter}
      />

      {/* VC Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse VCs</h2>
            <p className="text-lg text-gray-600">Find the perfect investor for your startup</p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vcs.map((vc) => (
                <VCCard key={vc.id} vc={vc} isAuthenticated={true} />
              ))}
            </div>
          )}
          
          {!isLoading && vcs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No VCs found matching your filters.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
