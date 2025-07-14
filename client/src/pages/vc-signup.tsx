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
  telegramHandle: z.string().optional(),
  meetingLink: z.string().optional(),
}).omit({ userId: true, isVerified: true, isActive: true })
.refine((data) => {
  if (data.contactType === "telegram" || data.contactType === "both") {
    return data.telegramHandle && data.telegramHandle.length > 0;
  }
  return true;
}, {
  message: "Telegram handle is required when selected",
  path: ["telegramHandle"],
})
.refine((data) => {
  if (data.contactType === "meeting" || data.contactType === "both") {
    return data.meetingLink && data.meetingLink.length > 0;
  }
  return true;
}, {
  message: "Meeting link is required when selected",
  path: ["meetingLink"],
});

type VCSignupForm = z.infer<typeof vcSignupSchema>;

const VERTICAL_OPTIONS = [
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
      contactType: "telegram",
      price: 4900, // $49 in cents
      weeklyIntroLimit: 5,
      sectors: [],
      stage: [],
    },
  });

  const contactType = watch("contactType");
  const price = watch("price");
  const telegramHandle = watch("telegramHandle");
  const meetingLink = watch("meetingLink");
  const sectors = watch("sectors") || [];
  const stages = watch("stage") || [];

  const createVCMutation = useMutation({
    mutationFn: async (data: VCSignupForm) => {
      // Set the main contactHandle based on the contactType
      let contactHandle = data.contactHandle || "";
      if (data.contactType === "telegram") {
        contactHandle = data.telegramHandle || "";
      } else if (data.contactType === "meeting") {
        contactHandle = data.meetingLink || "";
      } else if (data.contactType === "both") {
        contactHandle = `Telegram: ${data.telegramHandle || ""}, Meeting: ${data.meetingLink || ""}`;
      }
      
      return await apiRequest("POST", "/api/vcs", {
        ...data,
        sectors: data.sectors, // Already an array
        contactHandle,
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

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@exampleventures.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
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
                  <Label htmlFor="meetingUrl">Meeting/Calendly URL</Label>
                  <Input
                    id="meetingUrl"
                    {...register("meetingUrl")}
                    placeholder="https://calendly.com/yourname or https://cal.com/yourname"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your dedicated meeting scheduling link (separate from contact preference below)
                  </p>
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
                  <Label htmlFor="investmentThesis">Investment Thesis (One-liner)</Label>
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

                <div>
                  <Label className="text-base font-medium">How should founders contact you?</Label>
                  <p className="text-sm text-gray-600 mb-4">Select one or both options below</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="telegram-option"
                        checked={contactType === "telegram" || contactType === "both"}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue("contactType", contactType === "meeting" ? "both" : "telegram");
                          } else {
                            setValue("contactType", contactType === "both" ? "meeting" : "");
                          }
                        }}
                      />
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="telegram-option" className="text-sm font-medium">
                          Telegram Handle (Direct messaging)
                        </Label>
                        <Input
                          placeholder="@yourtelegram"
                          {...register("telegramHandle")}
                          disabled={!(contactType === "telegram" || contactType === "both")}
                          className={`${!(contactType === "telegram" || contactType === "both") ? "bg-gray-50" : ""} ${errors.telegramHandle ? "border-red-500" : ""}`}
                        />
                        {errors.telegramHandle && (
                          <p className="text-sm text-red-500">{errors.telegramHandle.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="meeting-option"
                        checked={contactType === "meeting" || contactType === "both"}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue("contactType", contactType === "telegram" ? "both" : "meeting");
                          } else {
                            setValue("contactType", contactType === "both" ? "telegram" : "");
                          }
                        }}
                      />
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="meeting-option" className="text-sm font-medium">
                          Meeting Link (Scheduled calls)
                        </Label>
                        <Input
                          placeholder="https://calendly.com/yourname"
                          {...register("meetingLink")}
                          disabled={!(contactType === "meeting" || contactType === "both")}
                          className={`${!(contactType === "meeting" || contactType === "both") ? "bg-gray-50" : ""} ${errors.meetingLink ? "border-red-500" : ""}`}
                        />
                        {errors.meetingLink && (
                          <p className="text-sm text-red-500">{errors.meetingLink.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price">Your Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register("price", { valueAsNumber: true })}
                      min={25}
                      placeholder="49"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                    )}
                  </div>
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

                <p className="text-sm text-gray-500 text-center">Applications are reviewed within 24 - 48 hours. You'll receive an email with next steps.</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
