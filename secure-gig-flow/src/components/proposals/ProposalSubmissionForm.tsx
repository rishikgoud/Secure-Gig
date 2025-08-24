import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { JobPost } from '@/api/types';
import { apiClient } from '@/api/client';
import { 
  DollarSign, 
  Clock, 
  FileText, 
  Link as LinkIcon, 
  Plus, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

// Validation schema matching backend
const proposalFormSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  coverLetter: z.string()
    .min(50, 'Cover letter must be at least 50 characters long')
    .max(2000, 'Cover letter cannot exceed 2000 characters'),
  proposedRate: z.object({
    amount: z.number()
      .min(0, 'Amount must be greater than or equal to 0'),
    currency: z.enum(['USD', 'AVAX', 'ETH'], {
      required_error: 'Please select a currency'
    }),
    type: z.enum(['fixed', 'hourly'], {
      required_error: 'Please select rate type'
    })
  }),
  timeline: z.object({
    duration: z.number()
      .min(1, 'Duration must be at least 1'),
    unit: z.enum(['days', 'weeks', 'months'], {
      required_error: 'Please select timeline unit'
    }),
    startDate: z.string().optional()
  }),
  experience: z.string()
    .min(20, 'Experience description must be at least 20 characters long')
    .max(1000, 'Experience description cannot exceed 1000 characters'),
  portfolioLinks: z.array(z.string().url('Please enter valid URLs')).optional(),
  attachments: z.array(z.string()).optional()
});

type ProposalFormData = z.infer<typeof proposalFormSchema>;

interface ProposalSubmissionFormProps {
  job: JobPost;
  onSubmit?: (proposalData: ProposalFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export type { ProposalFormData };

const ProposalSubmissionForm: React.FC<ProposalSubmissionFormProps> = ({
  job,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  
  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      jobId: job._id || job.id || '',
      coverLetter: '',
      proposedRate: {
        amount: 0,
        currency: job.budget?.currency || 'USD',
        type: job.budget?.type || 'fixed'
      },
      timeline: {
        duration: 1,
        unit: 'weeks'
      },
      experience: '',
      portfolioLinks: []
    }
  });

  const { handleSubmit, control, formState: { errors }, watch, setValue } = form;
  const watchedValues = watch();


  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const onSubmitForm = async (data: ProposalFormData) => {
    try {
      setIsLoading(true);
      
      // Filter out empty portfolio links
      const validPortfolioLinks = portfolioLinks.filter(link => link.trim() && isValidUrl(link));
      
      const proposalData: ProposalFormData = {
        ...data,
        jobId: job._id || job.id || data.jobId,
        portfolioLinks: validPortfolioLinks
      };

      console.log('🚀 Submitting proposal:', proposalData);

      if (onSubmit) {
        await onSubmit(proposalData);
      } else {
        // Default submission using API client
        await apiClient.createProposal(proposalData);
      }
      
      toast({
        title: "Proposal Submitted! 🎉",
        description: "Your proposal has been submitted successfully!",
        variant: "default"
      });
      
      // Close the form
      onCancel();
      
    } catch (error) {
      console.error('❌ Proposal submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit proposal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };

  const removePortfolioLink = (index: number) => {
    if (portfolioLinks.length > 1) {
      const newLinks = portfolioLinks.filter((_, i) => i !== index);
      setPortfolioLinks(newLinks);
    }
  };

  const updatePortfolioLink = (index: number, value: string) => {
    const newLinks = [...portfolioLinks];
    newLinks[index] = value;
    setPortfolioLinks(newLinks);
    setValue('portfolioLinks', newLinks.filter(link => link.trim()));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-blue-400" />
            Submit Proposal
          </CardTitle>
          <CardDescription className="text-gray-300">
            Apply for: <span className="font-semibold text-white">{job.title}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Job Summary */}
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-gray-200">Budget: {job.budget?.currency} {job.budget?.amount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-200">Deadline: {job.timeline?.endDate ? new Date(job.timeline.endDate).toLocaleDateString() : 'Not specified'}</span>
                </div>
                <div>
                  <Badge variant="outline" className="border-gray-600 text-gray-200">{job.category}</Badge>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-base font-semibold text-white">
                Cover Letter *
              </Label>
              <p className="text-sm text-gray-400">
                Explain why you're the best fit for this project (50-2000 characters)
              </p>
              <Controller
                name="coverLetter"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="coverLetter"
                    placeholder="Dear Client,

I am excited to apply for your project. With my experience in [relevant skills], I can deliver high-quality results that meet your requirements.

My approach would be to:
1. [Step 1]
2. [Step 2]
3. [Step 3]

I have successfully completed similar projects, including [specific examples]. 

I'm available to start immediately and can deliver within your timeline.

Best regards"
                    rows={8}
                    className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400 ${errors.coverLetter ? 'border-red-500' : ''}`}
                  />
                )}
              />
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">{watchedValues.coverLetter?.length || 0}/2000 characters</span>
                {errors.coverLetter && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.coverLetter.message}
                  </span>
                )}
              </div>
            </div>

            {/* Proposed Rate */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-white">Proposed Rate *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-200">Amount</Label>
                  <Controller
                    name="proposedRate.amount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400 ${errors.proposedRate?.amount ? 'border-red-500' : ''}`}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-gray-200">Currency</Label>
                  <Controller
                    name="proposedRate.currency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue className="text-white" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="USD" className="text-white hover:bg-gray-700">USD</SelectItem>
                          <SelectItem value="AVAX" className="text-white hover:bg-gray-700">AVAX</SelectItem>
                          <SelectItem value="ETH" className="text-white hover:bg-gray-700">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateType" className="text-gray-200">Rate Type</Label>
                  <Controller
                    name="proposedRate.type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue className="text-white" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="fixed" className="text-white hover:bg-gray-700">Fixed Price</SelectItem>
                          <SelectItem value="hourly" className="text-white hover:bg-gray-700">Hourly Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              {(errors.proposedRate?.amount || errors.proposedRate?.currency || errors.proposedRate?.type) && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    {errors.proposedRate?.amount?.message || errors.proposedRate?.currency?.message || errors.proposedRate?.type?.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-white">Project Timeline *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-200">Duration</Label>
                  <Controller
                    name="timeline.duration"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="duration"
                        type="number"
                        min="1"
                        placeholder="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400 ${errors.timeline?.duration ? 'border-red-500' : ''}`}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeUnit" className="text-gray-200">Time Unit</Label>
                  <Controller
                    name="timeline.unit"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue className="text-white" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="days" className="text-white hover:bg-gray-700">Days</SelectItem>
                          <SelectItem value="weeks" className="text-white hover:bg-gray-700">Weeks</SelectItem>
                          <SelectItem value="months" className="text-white hover:bg-gray-700">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              {(errors.timeline?.duration || errors.timeline?.unit) && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    {errors.timeline?.duration?.message || errors.timeline?.unit?.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-base font-semibold text-white">
                Relevant Experience *
              </Label>
              <p className="text-sm text-gray-400">
                Describe your relevant experience and past projects (20-1000 characters)
              </p>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="experience"
                    placeholder="I have 3+ years of experience in [relevant field]. Some of my notable projects include:

• [Project 1]: Brief description and outcome
• [Project 2]: Brief description and outcome
• [Project 3]: Brief description and outcome

I'm proficient in [relevant technologies/skills] and have successfully delivered similar projects for clients in [industry/domain]."
                    rows={6}
                    className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400 ${errors.experience ? 'border-red-500' : ''}`}
                  />
                )}
              />
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">{watchedValues.experience?.length || 0}/1000 characters</span>
                {errors.experience && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.experience.message}
                  </span>
                )}
              </div>
            </div>

            {/* Portfolio Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-white">Portfolio Links (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPortfolioLink}
                  className="flex items-center gap-2 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              </div>
              <p className="text-sm text-gray-400">
                Share links to your relevant work, GitHub repositories, or portfolio
              </p>
              
              {portfolioLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="https://github.com/username/project or https://portfolio.com"
                      value={link}
                      onChange={(e) => updatePortfolioLink(index, e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                  {portfolioLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePortfolioLink(index)}
                      className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {errors.portfolioLinks && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{errors.portfolioLinks.message}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Proposal
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalSubmissionForm;
