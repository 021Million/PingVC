import { useQuery } from "@tanstack/react-query";
import { ColdInvestorCard } from "./cold-investor-card";

interface ColdInvestor {
  id: number;
  fundName: string;
  fundSlug: string;
  website?: string;
  investmentFocus?: string;
}

interface ColdInvestorDetailCardProps {
  investor: ColdInvestor;
  userEmail?: string;
}

export function ColdInvestorDetailCard({ investor, userEmail }: ColdInvestorDetailCardProps) {
  const { data: fundData, isLoading } = useQuery({
    queryKey: ["/api/cold-investors", investor.fundSlug],
    queryFn: async () => {
      const response = await fetch(`/api/cold-investors/${investor.fundSlug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch fund details');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (!fundData || !fundData.decisionMakers) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Unable to load fund details</p>
      </div>
    );
  }

  return (
    <ColdInvestorCard 
      investor={investor}
      decisionMakers={fundData.decisionMakers}
      userEmail={userEmail}
    />
  );
}