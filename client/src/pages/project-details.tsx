import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  ArrowLeft, 
  Globe, 
  ExternalLink, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  Award,
  Building,
  Target,
  Linkedin,
  Twitter as X
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ImprovedHeader } from "@/components/improved-header";

export default function ProjectDetails() {
  const { id } = useParams();
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-32 rounded mb-8"></div>
            <div className="bg-gray-200 h-64 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-6 rounded w-3/4"></div>
              <div className="bg-gray-200 h-6 rounded w-1/2"></div>
              <div className="bg-gray-200 h-6 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ImprovedHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/scout">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scout
            </Link>
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600">The project you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ImprovedHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="outline" asChild className="mb-6">
          <Link href="/scout">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scout
          </Link>
        </Button>

        {/* Project Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {project.logoUrl && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src={project.logoUrl} 
                      alt={`${project.companyName} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {project.companyName || "Stealth Startup"}
                  </CardTitle>
                  {project.oneLineDescription && (
                    <p className="text-xl text-gray-600 mb-4">{project.oneLineDescription}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{project.ecosystem || "Multi-chain"}</Badge>
                    <Badge variant="outline">{project.vertical || "General"}</Badge>
                    {project.isRaising && (
                      <Badge className="bg-green-100 text-green-800">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Raising
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Vote Count */}
              <div className="text-center">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-bold text-xl">{project.voteCount || 0}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">community votes</p>
              </div>
            </div>
          </CardHeader>
          
          {project.description && (
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.founderName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Founder</label>
                  <p className="text-gray-900">{project.founderName}</p>
                </div>
              )}
              
              {project.teamSize && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Team Size</label>
                  <p className="text-gray-900">{project.teamSize} people</p>
                </div>
              )}
              
              {project.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{project.location}</p>
                </div>
              )}

              {project.teamRoles && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Team Composition</label>
                  <p className="text-gray-900">{project.teamRoles}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fundraising Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Fundraising
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.roundType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Round Type</label>
                  <p className="text-gray-900">{project.roundType}</p>
                </div>
              )}
              
              {project.amountRaising && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount Raising</label>
                  <p className="text-gray-900 font-semibold text-green-600">
                    ${(project.amountRaising / 1000000).toFixed(1)}M
                  </p>
                </div>
              )}
              
              {project.valuation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Valuation</label>
                  <p className="text-gray-900">{project.valuation}</p>
                </div>
              )}

              {project.committedAmount && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Committed Amount</label>
                  <p className="text-gray-900">${(project.committedAmount / 1000000).toFixed(1)}M</p>
                </div>
              )}

              {project.idealInvestorType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ideal Investor</label>
                  <p className="text-gray-900">{project.idealInvestorType}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Traction Section */}
        {project.traction && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Traction & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{project.traction}</p>
            </CardContent>
          </Card>
        )}

        {/* Links & Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Links & Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {project.websiteUrl && (
                <Button variant="outline" asChild>
                  <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              
              {project.linkedinUrl && (
                <Button variant="outline" asChild>
                  <a href={project.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
              
              {project.twitterUrl && (
                <Button variant="outline" asChild>
                  <a href={project.twitterUrl} target="_blank" rel="noopener noreferrer">
                    <X className="h-4 w-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              )}

              {project.dataRoomUrl && (
                <Button variant="outline" asChild>
                  <a href={project.dataRoomUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Data Room
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.email ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 mb-2">
                    Interested in learning more? Reach out to the founder directly.
                  </p>
                  <p className="text-sm text-gray-500">
                    Contact: {project.email}
                  </p>
                </div>
                <Button asChild>
                  <a href={`mailto:${project.email}?subject=Interest in ${project.companyName || 'your project'}`}>
                    Contact Founder
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-gray-600">
                Contact information not available. Check the project's website or social media for more details.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}