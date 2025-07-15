import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import { Header } from "@/components/header";
import { DragDropUpload } from "@/components/drag-drop-upload";

export default function ProjectSetup() {
  const [formData, setFormData] = useState({
    companyName: "",
    logoUrl: "",
    description: "",
    projectStage: "",
    tickerLaunched: false,
    dexScreenerUrl: "",
    pitchDeckUrl: "",
    amountRaising: "",
    valuation: "",
    traction: "",
    ecosystem: "",
    vertical: "",
    dataRoomUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    founderTwitterUrl: "",
    websiteUrl: "",
    revenueGenerating: false,
  });
  
  const { toast } = useToast();

  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/founder/project", data);
    },
    onSuccess: () => {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
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

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/create-scout-payment", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
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

    if (!formData.description.trim()) {
      toast({
        title: "Required Field",
        description: "Please provide a project description.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      amountRaising: formData.amountRaising ? parseInt(formData.amountRaising.replace(/[^\d]/g, '')) : null,
      valuation: formData.valuation ? parseInt(formData.valuation.replace(/[^\d]/g, '')) : null,
    };

    updateProjectMutation.mutate(submitData);
  };

  const handlePublishToScout = () => {
    if (!formData.companyName.trim() || !formData.description.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in company name and description before publishing.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      amountRaising: formData.amountRaising ? parseInt(formData.amountRaising.replace(/[^\d]/g, '')) : null,
      valuation: formData.valuation ? parseInt(formData.valuation.replace(/[^\d]/g, '')) : null,
    };

    // Create Stripe payment for $9 Scout marketplace publishing
    createPaymentMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Setup Your Project</CardTitle>
            <p className="text-gray-600">Add your project details to get discovered by VCs and appear in our Marketplace</p>
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

                <DragDropUpload
                  onFileSelect={(file) => {
                    // File handling is done in the component
                    console.log('File selected:', file.name);
                  }}
                  onUrlChange={(url) => handleInputChange("logoUrl", url)}
                  currentUrl={formData.logoUrl}
                  placeholder="Drop your company logo here or click to browse"
                  maxSize={5}
                />

                <div>
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your project, what it does, and its value proposition"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="projectStage">Project Stage</Label>
                  <Select value={formData.projectStage} onValueChange={(value) => handleInputChange("projectStage", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idea">Idea</SelectItem>
                      <SelectItem value="MVP">MVP</SelectItem>
                      <SelectItem value="Beta">Beta</SelectItem>
                      <SelectItem value="Live">Live</SelectItem>
                      <SelectItem value="Growth">Growth</SelectItem>
                      <SelectItem value="Scaling">Scaling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tickerLaunched"
                    checked={formData.tickerLaunched}
                    onCheckedChange={(checked) => handleInputChange("tickerLaunched", checked)}
                  />
                  <Label htmlFor="tickerLaunched">Ticker Launched</Label>
                </div>

                {formData.tickerLaunched && (
                  <div>
                    <Label htmlFor="dexScreenerUrl">DEX Screener URL</Label>
                    <Input
                      id="dexScreenerUrl"
                      value={formData.dexScreenerUrl}
                      onChange={(e) => handleInputChange("dexScreenerUrl", e.target.value)}
                      placeholder="https://dexscreener.com/..."
                      type="url"
                    />
                  </div>
                )}

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
                        <SelectItem value="RWA">RWA</SelectItem>
                        <SelectItem value="Stablecoins">Stablecoins</SelectItem>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="AI/ML">AI/ML</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amountRaising">Amount Raising (USD)</Label>
                    <Input
                      id="amountRaising"
                      value={formData.amountRaising}
                      onChange={(e) => handleInputChange("amountRaising", e.target.value)}
                      placeholder=""
                      type="number"
                    />
                    {!formData.amountRaising && (
                      <p className="text-sm text-gray-500 mt-1">
                        If left blank, will show "Please get in contact with founder"
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="valuation">Valuation (USD)</Label>
                    <Input
                      id="valuation"
                      value={formData.valuation}
                      onChange={(e) => handleInputChange("valuation", e.target.value)}
                      placeholder=""
                      type="number"
                    />
                    {!formData.valuation && (
                      <p className="text-sm text-gray-500 mt-1">
                        Optional - if left blank, will show contact founder message
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="revenueGenerating"
                    checked={formData.revenueGenerating}
                    onCheckedChange={(checked) => handleInputChange("revenueGenerating", checked)}
                  />
                  <Label htmlFor="revenueGenerating">Revenue Generating</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Label htmlFor="twitterUrl">Company Twitter URL</Label>
                    <Input
                      id="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                      placeholder="https://twitter.com/yourcompany"
                      type="url"
                    />
                  </div>

                  <div>
                    <Label htmlFor="founderTwitterUrl">Founder Twitter URL</Label>
                    <Input
                      id="founderTwitterUrl"
                      value={formData.founderTwitterUrl}
                      onChange={(e) => handleInputChange("founderTwitterUrl", e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                      type="url"
                    />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Publishing Options</h4>
                <div className="text-blue-800 text-sm space-y-2">
                  <p><strong>Save Project Details:</strong> Saves your information privately to your profile.</p>
                  <p><strong>Publish to Scout Marketplace ($9):</strong> Makes your project visible in our public Scout marketplace where investors and the community can discover your startup.</p>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 If you leave Amount Raising or Valuation blank, visitors will see "Please get in contact with founder" with links to your social profiles.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? "Saving..." : "Save Project Details"}
                </Button>
                <Button 
                  type="button" 
                  onClick={handlePublishToScout} 
                  disabled={createPaymentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createPaymentMutation.isPending ? "Processing..." : "Publish to Scout Marketplace ($9)"}
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