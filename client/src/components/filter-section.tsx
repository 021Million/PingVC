import { Button } from "@/components/ui/button";

interface FilterSectionProps {
  stageFilter: string;
  sectorFilter: string;
  onStageChange: (stage: string) => void;
  onSectorChange: (sector: string) => void;
}

const stages = ["All", "Pre-Seed", "Seed", "Series A", "Series B+"];
const sectors = ["DeFi", "Stablecoins", "RWA", "Infrastructure", "AI/ML"];

export function FilterSection({ stageFilter, sectorFilter, onStageChange, onSectorChange }: FilterSectionProps) {
  return (
    <section className="bg-white py-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 mr-4">Filter by stage:</span>
            {stages.map((stage) => (
              <Button
                key={stage}
                size="sm"
                variant={stageFilter === stage ? "default" : "outline"}
                onClick={() => onStageChange(stage)}
                className={stageFilter === stage ? "bg-primary text-white" : ""}
              >
                {stage}
              </Button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 mr-4">Sectors:</span>
            {sectors.map((sector) => (
              <Button
                key={sector}
                size="sm"
                variant={sectorFilter === sector ? "default" : "outline"}
                onClick={() => onSectorChange(sectorFilter === sector ? "" : sector)}
                className={sectorFilter === sector ? "bg-primary text-white" : ""}
              >
                {sector}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
