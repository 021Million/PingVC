import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Linkedin, Twitter, Lock, Unlock } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DecisionMakerPayment from "./decision-maker-payment";

interface DecisionMaker {
  id: number;
  fullName: string;
  role: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

interface ColdInvestor {
  id: number;
  fundName: string;
  fundSlug: string;
  website?: string;
  investmentFocus?: string;
}

interface ColdInvestorCardProps {
  investor: ColdInvestor;
  decisionMakers: DecisionMaker[];
  userEmail?: string;
}

export function ColdInvestorCard({ investor, decisionMakers, userEmail }: ColdInvestorCardProps) {
  const [unlockedDecisionMakers, setUnlockedDecisionMakers] = useState<Set<number>>(new Set());
  const [unlockingDMs, setUnlockingDMs] = useState<Set<number>>(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDecisionMakerId, setSelectedDecisionMakerId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userEmail) return;

    // Check unlock status for all decision makers
    const checkUnlockStatus = async () => {
      const promises = decisionMakers.map(async (dm) => {
        try {
          const response = await fetch(`/api/check-decision-maker-unlock?email=${encodeURIComponent(userEmail)}&decisionMakerId=${dm.id}`);
          const data = await response.json();
          return { dmId: dm.id, hasUnlocked: data.hasUnlocked };
        } catch (error) {
          return { dmId: dm.id, hasUnlocked: false };
        }
      });

      const results = await Promise.all(promises);
      const unlockedSet = new Set(
        results.filter(result => result.hasUnlocked).map(result => result.dmId)
      );
      setUnlockedDecisionMakers(unlockedSet);
    };

    checkUnlockStatus();
  }, [decisionMakers, userEmail]);

  const handleUnlockDecisionMaker = (decisionMakerId: number) => {
    if (!userEmail) {
      toast({
        title: "Email Required",
        description: "Please provide your email to unlock contact details",
        variant: "destructive",
      });
      return;
    }

    setSelectedDecisionMakerId(decisionMakerId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    if (selectedDecisionMakerId) {
      setUnlockedDecisionMakers(prev => new Set(prev).add(selectedDecisionMakerId));
      setSelectedDecisionMakerId(null);
    }
  };

  const blurText = (text: string) => (
    <span 
      className="filter blur-sm text-gray-400 select-none cursor-default" 
      title="Unlock to view"
    >
      {text}
    </span>
  );

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {investor.fundName}
            </CardTitle>
            <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-600 border-orange-200">
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
        {investor.investmentFocus && (
          <p className="text-sm text-gray-600 mt-2">{investor.investmentFocus}</p>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Decision Makers
          </h4>
          
          {decisionMakers.map((dm) => {
            const isUnlocked = unlockedDecisionMakers.has(dm.id);
            const isUnlocking = unlockingDMs.has(dm.id);

            return (
              <div key={dm.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{dm.role}</p>
                    <p className="text-sm text-gray-600">
                      {isUnlocked ? dm.fullName : blurText(dm.fullName)}
                    </p>
                  </div>
                  
                  {!isUnlocked && (
                    <Button
                      size="sm"
                      onClick={() => handleUnlockDecisionMaker(dm.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      🔓 Unlock for $1
                    </Button>
                  )}
                </div>

                {isUnlocked && (
                  <div className="flex gap-2 pt-2">
                    {dm.linkedinUrl && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={dm.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {dm.twitterUrl && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={dm.twitterUrl} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Payment Modal */}
      {showPaymentModal && selectedDecisionMakerId && userEmail && (
        <DecisionMakerPayment
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedDecisionMakerId(null);
          }}
          decisionMakerId={selectedDecisionMakerId}
          email={userEmail}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Card>
  );
}