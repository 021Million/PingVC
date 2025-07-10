import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function ProjectSetup() {
  const [formData, setFormData] = useState({
    companyName: "",
    pitchDeckUrl: "",
    amountRaising: "",
    traction: "",
    ecosystem: "",
    vertical: "",
    dataRoomUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    websiteUrl: "",
  });
  
  const { toast } = useToast();

  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/founder/project", data);
    },
    onSuccess: () => {
      toast({
        title: "Project Updated",
        description: "Your project information has been saved successfully!",
      });
      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      toast({
        title: "Required Field",
        description: "Please provide your company name.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      amountRaising: formData.amountRaising ? parseInt(formData.amountRaising.replace(/[^\d]/g, '')) : null,
    };

    updateProjectMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Ping Me</span>
              </a>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Setup Your Project</CardTitle>
            <p className="text-gray-600">
              Add your project details to get discovered by VCs and appear in our Scout marketplace
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ecosystem">Ecosystem</Label>
                    <Select onValueChange={(value) => handleInputChange("ecosystem", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ecosystem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ethereum">Ethereum</SelectItem>
                        <SelectItem value="Binance Smart Chain">Binance Smart Chain</SelectItem>
                        <SelectItem value="Avalanche">Avalanche</SelectItem>
                        <SelectItem value="Cardano">Cardano</SelectItem>
                        <SelectItem value="TON">TON</SelectItem>
                        <SelectItem value="Sui">Sui</SelectItem>
                        <SelectItem value="Polkadot">Polkadot</SelectItem>
                        <SelectItem value="Cosmos">Cosmos</SelectItem>
                        <SelectItem value="Optimism">Optimism</SelectItem>
                        <SelectItem value="Apotos">Apotos</SelectItem>
                        <SelectItem value="Hedera">Hedera</SelectItem>
                        <SelectItem value="Base">Base</SelectItem>
                        <SelectItem value="Stellar">Stellar</SelectItem>
                        <SelectItem value="Arbitrum">Arbitrum</SelectItem>
                        <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                        <SelectItem value="Solana">Solana</SelectItem>
                        <SelectItem value="Polygon">Polygon</SelectItem>
                        <SelectItem value="Multi-chain">Multi-chain</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="vertical">Vertical</Label>
                    <Select onValueChange={(value) => handleInputChange("vertical", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vertical" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                        <SelectItem value="Payments">Payments</SelectItem>
                        <SelectItem value="Identity">Identity</SelectItem>
                        <SelectItem value="DAO">DAO</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Meme">Meme</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Compute">Compute</SelectItem>
                        <SelectItem value="SocialFi">SocialFi</SelectItem>
                        <SelectItem value="Data">Data</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Privacy">Privacy</SelectItem>
                        <SelectItem value="DeFi">DeFi</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="NFTs">NFTs</SelectItem>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="Stablecoins">Stablecoins</SelectItem>
                        <SelectItem value="RWA">RWA</SelectItem>
                        <SelectItem value="AI/ML">AI/ML</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="amountRaising">Amount Raising (USD)</Label>
                  <Input
                    id="amountRaising"
                    value={formData.amountRaising}
                    onChange={(e) => handleInputChange("amountRaising", e.target.value)}
                    placeholder="e.g., 2000000 for $2M"
                    type="number"
                  />
                </div>

                <div>
                  <Label htmlFor="traction">Traction Summary</Label>
                  <Textarea
                    id="traction"
                    value={formData.traction}
                    onChange={(e) => handleInputChange("traction", e.target.value)}
                    placeholder="Describe your key metrics, user growth, revenue, partnerships, etc."
                    rows={4}
                  />
                </div>
              </div>

              {/* Links and Resources */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Links & Resources</h3>
                
                <div>
                  <Label htmlFor="pitchDeckUrl">Pitch Deck URL</Label>
                  <Input
                    id="pitchDeckUrl"
                    value={formData.pitchDeckUrl}
                    onChange={(e) => handleInputChange("pitchDeckUrl", e.target.value)}
                    placeholder="https://docs.google.com/presentation/..."
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="dataRoomUrl">Data Room URL</Label>
                  <Input
                    id="dataRoomUrl"
                    value={formData.dataRoomUrl}
                    onChange={(e) => handleInputChange("dataRoomUrl", e.target.value)}
                    placeholder="https://your-data-room-link.com"
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                    placeholder="https://yourcompany.com"
                    type="url"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      type="url"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitterUrl">Twitter URL</Label>
                    <Input
                      id="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                      type="url"
                    />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Scout Marketplace</h4>
                <p className="text-blue-800 text-sm">
                  Once you complete this setup, your project will appear in our Scout marketplace where the community can discover and vote for promising startups. Higher-voted projects get more visibility to our VC network.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? "Saving..." : "Save Project Details"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Skip for now</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}