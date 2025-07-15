import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVCSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, DollarSign, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import { ImageUpload } from "@/components/image-upload";

const vcSignupSchema = insertVCSchema.extend({
  sectors: z.array(z.string()).min(1, "Please select at least one sector"),
  stage: z.array(z.string()).min(1, "Please select at least one investment stage"),
  meetingLink: z.string().min(1, "Meeting link is required"),
  location: z.string().min(1, "Location is required"),
  investmentTag: z.string().min(1, "Investment tag is required"),
  fundDescription: z.string().min(1, "Fund description is required"),
  investmentThesis: z.string().min(1, "Investment thesis is required"),
  bio: z.string().min(1, "Bio is required"),
  portfolioPerformance: z.string().min(1, "Portfolio performance is required"),
  position: z.string().min(1, "Position is required"),
  donateToCharity: z.boolean().optional(),
  charityOfChoice: z.string().optional(),
}).omit({ userId: true, isVerified: true, isActive: true, contactType: true, telegramHandle: true });

type VCSignupForm = z.infer<typeof vcSignupSchema>;

const VERTICAL_OPTIONS = [
  "AI/ML",
  "DeFi",
  "RWA", 
  "Stablecoins",
  "Infrastructure",
  "Supply Chain",
  "Payments",
  "Identity",
  "DAO",
  "Healthcare", 
  "Meme",
  "Energy",
  "Compute",
  "SocialFi",
  "Data",
  "Education",
  "Privacy"
];

const STAGE_OPTIONS = [
  "Angel",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B+"
];

export default function VCSignup() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VCSignupForm>({
    resolver: zodResolver(vcSignupSchema),
    defaultValues: {
      price: 0, // Default to $0
      weeklyIntroLimit: 5,
      sectors: [],
      stage: [],
      donateToCharity: false,
      charityOfChoice: "",
      location: "",
      investmentTag: "",
      fundDescription: "",
      investmentThesis: "",
      bio: "",
      portfolioPerformance: "",
      position: "",
      meetingLink: "",
    },
  });

  const price = watch("price");
  const meetingLink = watch("meetingLink");
  const sectors = watch("sectors") || [];
  const stages = watch("stage") || [];
  const donateToCharity = watch("donateToCharity");
  const charityOfChoice = watch("charityOfChoice");

  const createVCMutation = useMutation({
    mutationFn: async (data: VCSignupForm) => {
      return await apiRequest("POST", "/api/vcs", {
        ...data,
        sectors: data.sectors, // Already an array
        contactHandle: data.meetingLink, // Use meeting link as contact handle
        contactType: "meeting", // Always meeting type
        price: Math.round(data.price * 100), // Convert to cents
      });
    },
    onSuccess: () => {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast({
        title: "Application Submitted!",
        description: "Your VC profile has been submitted for review. You'll hear back within 24 hours.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VCSignupForm) => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    createVCMutation.mutate(data);
  };

  const calculateEarnings = (price: number) => {
    return Math.round(price * 0.7 * 100) / 100; // 70% revenue share
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ping Me</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="text-gray-700 hover:text-primary font-medium"
              >
                Back to Browse
              </Button>
              {!isAuthenticated ? (
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-gray-700 hover:text-primary font-medium"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join as a VC or Angel</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Curated dealflow without the noise. Get quality founder intros and earn from each connection.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <Shield className="w-8 h-8 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Quality Founders</h3>
              <p className="text-sm text-gray-600">Only serious founders who pay to reach you</p>
            </Card>
            <Card className="p-6">
              <DollarSign className="w-8 h-8 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Earn Revenue</h3>
              <p className="text-sm text-gray-600">85% of each unlock fee goes to you or donated to charity</p>
            </Card>
            <Card className="p-6">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Stay In Control</h3>
              <p className="text-sm text-gray-600">Set your own pricing and intro limits</p>
            </Card>
          </div>
        </div>
      </section>
      {/* Signup Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">VC & Angel Application Form</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="partnerName">Your Full Name</Label>
                    <Input
                      id="partnerName"
                      {...register("partnerName")}
                      placeholder="John Smith"
                      className={errors.partnerName ? "border-red-500" : ""}
                    />
                    {errors.partnerName && (
                      <p className="text-sm text-red-500 mt-1">{errors.partnerName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="fundName">Fund Name</Label>
                    <Input
                      id="fundName"
                      {...register("fundName")}
                      placeholder="Example Ventures"
                      className={errors.fundName ? "border-red-500" : ""}
                    />
                    {errors.fundName && (
                      <p className="text-sm text-red-500 mt-1">{errors.fundName.message}</p>
                    )}
                  </div>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="twitterUrl">X Profile</Label>
                    <Input
                      id="twitterUrl"
                      {...register("twitterUrl")}
                      placeholder="https://x.com/yourhandle"
                      className={errors.twitterUrl ? "border-red-500" : ""}
                    />
                    {errors.twitterUrl && (
                      <p className="text-sm text-red-500 mt-1">{errors.twitterUrl.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                    <Input
                      id="linkedinUrl"
                      {...register("linkedinUrl")}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className={errors.linkedinUrl ? "border-red-500" : ""}
                    />
                    {errors.linkedinUrl && (
                      <p className="text-sm text-red-500 mt-1">{errors.linkedinUrl.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="telegramUrl">Telegram</Label>
                    <Input
                      id="telegramUrl"
                      {...register("telegramUrl")}
                      placeholder="@yourtelegram"
                      className={errors.telegramUrl ? "border-red-500" : ""}
                    />
                    {errors.telegramUrl && (
                      <p className="text-sm text-red-500 mt-1">{errors.telegramUrl.message}</p>
                    )}
                  </div>
                </div>



                <div>
                  <ImageUpload
                    value={watch("logoUrl")}
                    onChange={(url) => setValue("logoUrl", url)}
                    label="Fund Logo"
                    endpoint="/api/upload/vc-logo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="stage">Investment Stage</Label>
                    <p className="text-sm text-gray-600 mb-3">Select all stages you invest in</p>
                    <div className="grid grid-cols-1 gap-3 p-4 border border-gray-200 rounded-lg">
                      {STAGE_OPTIONS.map((stage) => (
                        <div key={stage} className="flex items-center space-x-2">
                          <Checkbox
                            id={`stage-${stage}`}
                            checked={Array.isArray(stages) && stages.includes(stage)}
                            onCheckedChange={(checked) => {
                              const currentStages = Array.isArray(stages) ? stages : [];
                              if (checked) {
                                setValue("stage", [...currentStages, stage]);
                              } else {
                                setValue("stage", currentStages.filter(s => s !== stage));
                              }
                            }}
                          />
                          <Label htmlFor={`stage-${stage}`} className="text-sm font-normal cursor-pointer">
                            {stage}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {Array.isArray(stages) && stages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Selected stages:</p>
                        <div className="flex flex-wrap gap-2">
                          {stages.map((stage) => (
                            <Badge key={stage} variant="secondary" className="text-xs">
                              {stage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.stage && (
                      <p className="text-sm text-red-500 mt-2">{errors.stage.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="sectors">Primary Sectors</Label>
                    <p className="text-sm text-gray-600 mb-3">Select all sectors you invest in</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-lg">
                      {VERTICAL_OPTIONS.map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sector-${sector}`}
                            checked={Array.isArray(sectors) && sectors.includes(sector)}
                            onCheckedChange={(checked) => {
                              const currentSectors = Array.isArray(sectors) ? sectors : [];
                              if (checked) {
                                setValue("sectors", [...currentSectors, sector]);
                              } else {
                                setValue("sectors", currentSectors.filter(s => s !== sector));
                              }
                            }}
                          />
                          <Label htmlFor={`sector-${sector}`} className="text-sm font-normal cursor-pointer">
                            {sector}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {Array.isArray(sectors) && sectors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Selected sectors:</p>
                        <div className="flex flex-wrap gap-2">
                          {sectors.map((sector) => (
                            <Badge key={sector} variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.sectors && (
                      <p className="text-sm text-red-500 mt-2">{errors.sectors.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="investmentThesis">Investment Thesis</Label>
                  <Textarea
                    id="investmentThesis"
                    {...register("investmentThesis")}
                    placeholder="Looking for ambitious founders building the future of..."
                    className={errors.investmentThesis ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors.investmentThesis && (
                    <p className="text-sm text-red-500 mt-1">{errors.investmentThesis.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="San Francisco, CA"
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      {...register("position")}
                      placeholder="Managing Partner"
                      className={errors.position ? "border-red-500" : ""}
                    />
                    {errors.position && (
                      <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="investmentTag">Investment Tag</Label>
                  <Input
                    id="investmentTag"
                    {...register("investmentTag")}
                    placeholder="Web3 Infrastructure"
                    className={errors.investmentTag ? "border-red-500" : ""}
                  />
                  {errors.investmentTag && (
                    <p className="text-sm text-red-500 mt-1">{errors.investmentTag.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fundDescription">Investment Thesis</Label>
                  <Textarea
                    id="fundDescription"
                    {...register("fundDescription")}
                    placeholder="Brief description of your fund's focus and investment approach..."
                    className={errors.fundDescription ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors.fundDescription && (
                    <p className="text-sm text-red-500 mt-1">{errors.fundDescription.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Personal Bio</Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Your background, experience, and what you bring to founders..."
                    className={errors.bio ? "border-red-500" : ""}
                    rows={4}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="portfolioPerformance">Portfolio Performance</Label>
                  <Textarea
                    id="portfolioPerformance"
                    {...register("portfolioPerformance")}
                    placeholder="Notable investments, exits, and portfolio highlights..."
                    className={errors.portfolioPerformance ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors.portfolioPerformance && (
                    <p className="text-sm text-red-500 mt-1">{errors.portfolioPerformance.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    {...register("meetingLink")}
                    placeholder="https://calendly.com/yourname"
                    className={errors.meetingLink ? "border-red-500" : ""}
                  />
                  {errors.meetingLink && (
                    <p className="text-sm text-red-500 mt-1">{errors.meetingLink.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Founders will use this link to schedule meetings with you
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price">Your Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register("price", { valueAsNumber: true })}
                      min={0}
                      placeholder="0"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      You earn 85% of each unlock fee {donateToCharity ? "(donated to your chosen charity)" : ""}
                    </p>
                  </div>
                </div>

                {/* Charity Donation Section */}
                <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="donateToCharity"
                      {...register("donateToCharity")}
                      checked={donateToCharity}
                      onCheckedChange={(checked) => setValue("donateToCharity", checked as boolean)}
                    />
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="donateToCharity" className="text-sm font-medium text-green-800">
                        🎯 Donate earnings to charity (Optional)
                      </Label>
                      <p className="text-sm text-green-700">
                        Choose to have your 85% earnings donated to a charity of your choice instead of receiving payment.
                      </p>
                    </div>
                  </div>

                  {donateToCharity && (
                    <div className="mt-4">
                      <Label htmlFor="charityOfChoice">Charity of Choice</Label>
                      <Input
                        id="charityOfChoice"
                        {...register("charityOfChoice")}
                        placeholder="e.g., Red Cross, Doctors Without Borders, Local Food Bank..."
                        className="mt-1"
                      />
                      <p className="text-xs text-green-600 mt-2">
                        💡 <strong>Note:</strong> Ping Me will organize the donation to your charity of choice in your name. 
                        Official receipts will be issued for tax purposes and proof of donation will be provided.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="weeklyIntroLimit">Weekly Intro Limit</Label>
                  <Input
                    id="weeklyIntroLimit"
                    type="number"
                    {...register("weeklyIntroLimit", { valueAsNumber: true })}
                    min={1}
                    placeholder="10"
                    className={errors.weeklyIntroLimit ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum intros you'll accept per week
                  </p>
                  {errors.weeklyIntroLimit && (
                    <p className="text-sm text-red-500 mt-1">{errors.weeklyIntroLimit.message}</p>
                  )}
                </div>

                {/* Revenue Share Info */}
                <Card className="bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Revenue Share</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    You keep 85% of each unlock fee. We handle payments, verification, and platform maintenance.
                  </p>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Your earnings:</span> ${price ? calculateEarnings(price) : '34.30'} per intro
                  </div>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-white py-4 text-lg font-semibold hover:bg-indigo-700 transition-colors"
                  disabled={createVCMutation.isPending}
                >
                  {createVCMutation.isPending ? "Submitting..." : "Apply to Join Ping Me"}
                </Button>

                <p className="text-sm text-gray-500 text-center">Applications are reviewed within 48 hours. You'll receive an email with next steps.</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
