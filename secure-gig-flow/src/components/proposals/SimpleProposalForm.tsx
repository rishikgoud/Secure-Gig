import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, X } from 'lucide-react';
import { isAuthenticated, getStoredToken } from '@/services/authService';

interface ProposalData {
  jobId: string;
  coverLetter: string;
  proposedRate: {
    amount: number;
    currency: 'USD' | 'AVAX' | 'ETH';
    type: 'fixed' | 'hourly';
  };
  timeline: {
    duration: number;
    unit: 'days' | 'weeks' | 'months';
    startDate?: string;
  };
  experience: string;
  portfolioLinks?: string[];
  attachments?: string[];
}

interface SimpleProposalFormProps {
  job: any;
  onSubmit: (data: ProposalData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function SimpleProposalForm({ job, onSubmit, onCancel, isSubmitting = false }: SimpleProposalFormProps) {
  console.log('SimpleProposalForm received job:', job);
  console.log('Job._id:', job._id);
  console.log('Job.id:', job.id);
  
  // Ensure we use the complete MongoDB ObjectId
  const jobId = job._id || job.id;
  console.log('Using jobId:', jobId);
  
  // Validate jobId exists and is a valid MongoDB ObjectId
  if (!jobId || jobId.length !== 24) {
    console.error('Invalid or missing job ID:', jobId);
  }
  
  const [formData, setFormData] = useState<ProposalData>({
    jobId: jobId,
    coverLetter: '',
    proposedRate: {
      amount: 0,
      currency: (job.budget?.currency as 'USD' | 'AVAX' | 'ETH') || 'USD',
      type: job.budget?.type || 'fixed'
    },
    timeline: {
      duration: 1,
      unit: 'weeks'
    },
    experience: '',
    portfolioLinks: [],
    attachments: []
  });

  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Cover letter validation
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (formData.coverLetter.trim().length < 50) {
      newErrors.coverLetter = 'Cover letter must be at least 50 characters';
    } else if (formData.coverLetter.trim().length > 2000) {
      newErrors.coverLetter = 'Cover letter cannot exceed 2000 characters';
    }

    // Proposed rate validation
    if (!formData.proposedRate.amount || formData.proposedRate.amount < 0) {
      newErrors.proposedRate = 'Proposed rate must be greater than or equal to 0';
    }

    // Timeline validation
    if (!formData.timeline.duration || formData.timeline.duration <= 0) {
      newErrors.timeline = 'Timeline duration must be greater than 0';
    }

    // Experience validation
    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience description is required';
    } else if (formData.experience.trim().length < 20) {
      newErrors.experience = 'Experience description must be at least 20 characters';
    } else if (formData.experience.trim().length > 1000) {
      newErrors.experience = 'Experience description cannot exceed 1000 characters';
    }

    // Portfolio links validation
    const validLinks = portfolioLinks.filter(link => link.trim());
    for (const link of validLinks) {
      try {
        new URL(link);
      } catch {
        newErrors.portfolioLinks = 'All portfolio links must be valid URLs';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication before form validation
    if (!isAuthenticated()) {
      console.error('User not authenticated');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    const validPortfolioLinks = portfolioLinks.filter(link => link.trim());
    
    // Validate jobId exists and is valid MongoDB ObjectId
    if (!formData.jobId) {
      console.error('JobId is missing:', formData.jobId);
      console.error('Job object:', job);
      return;
    }
    
    // Ensure we have a valid MongoDB ObjectId (24 hex characters)
    const jobIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!jobIdRegex.test(formData.jobId)) {
      console.error('Invalid jobId format:', formData.jobId);
      return;
    }
    
    const submissionData: ProposalData = {
      jobId: formData.jobId, // Use the actual MongoDB ObjectId
      coverLetter: formData.coverLetter.trim(),
      proposedRate: {
        amount: Number(formData.proposedRate.amount),
        currency: formData.proposedRate.currency,
        type: formData.proposedRate.type
      },
      timeline: {
        duration: Number(formData.timeline.duration),
        unit: formData.timeline.unit
      },
      experience: formData.experience.trim(),
      portfolioLinks: validPortfolioLinks.length > 0 ? validPortfolioLinks : undefined,
      attachments: formData.attachments && formData.attachments.length > 0 ? formData.attachments : undefined
    };

    console.log('Submitting proposal data:', submissionData);
    
    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const updatePortfolioLink = (index: number, value: string) => {
    const updated = [...portfolioLinks];
    updated[index] = value;
    setPortfolioLinks(updated);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Proposal for "{job.title}"</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              placeholder="Explain why you're the perfect fit for this project..."
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
            {errors.coverLetter && (
              <p className="text-sm text-red-500">{errors.coverLetter}</p>
            )}
            <p className="text-sm text-gray-500">
              {formData.coverLetter.length}/2000 characters (minimum 50)
            </p>
          </div>

          {/* Proposed Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Proposed Rate *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.proposedRate.amount || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  proposedRate: {
                    ...formData.proposedRate,
                    amount: parseFloat(e.target.value) || 0
                  }
                })}
                disabled={isSubmitting}
              />
              {errors.proposedRate && (
                <p className="text-sm text-red-500">{errors.proposedRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.proposedRate.currency}
                onValueChange={(value: 'USD' | 'AVAX' | 'ETH') => setFormData({
                  ...formData,
                  proposedRate: { ...formData.proposedRate, currency: value }
                })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="AVAX">AVAX</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rate Type</Label>
              <Select
                value={formData.proposedRate.type}
                onValueChange={(value: 'fixed' | 'hourly') => setFormData({
                  ...formData,
                  proposedRate: { ...formData.proposedRate, type: value }
                })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Timeline Duration *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="1"
                value={formData.timeline.duration || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  timeline: {
                    ...formData.timeline,
                    duration: parseInt(e.target.value) || 1
                  }
                })}
                disabled={isSubmitting}
              />
              {errors.timeline && (
                <p className="text-sm text-red-500">{errors.timeline}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Timeline Unit</Label>
              <Select
                value={formData.timeline.unit}
                onValueChange={(value: 'days' | 'weeks' | 'months') => setFormData({
                  ...formData,
                  timeline: { ...formData.timeline, unit: value }
                })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Relevant Experience *</Label>
            <Textarea
              id="experience"
              placeholder="Describe your relevant experience for this project..."
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
            {errors.experience && (
              <p className="text-sm text-red-500">{errors.experience}</p>
            )}
            <p className="text-sm text-gray-500">
              {formData.experience.length}/1000 characters (minimum 20)
            </p>
          </div>

          {/* Portfolio Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Portfolio Links (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPortfolioLink}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            </div>
            
            {portfolioLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="https://example.com/portfolio"
                  value={link}
                  onChange={(e) => updatePortfolioLink(index, e.target.value)}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePortfolioLink(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {errors.portfolioLinks && (
              <p className="text-sm text-red-500">{errors.portfolioLinks}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Proposal'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
