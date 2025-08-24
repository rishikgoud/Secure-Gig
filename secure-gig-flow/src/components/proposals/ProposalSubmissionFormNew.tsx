import React from 'react';
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
  onSubmit: (proposalData: ProposalFormData) => Promise<void>;
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
  
  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      jobId: job._id,
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
    },
    mode: 'onChange'
  });

  const { control, handleSubmit, formState: { errors, isValid, isDirty }, watch, setValue, getValues } = form;
  const portfolioLinks = watch('portfolioLinks') || [];
  
  const addPortfolioLink = () => {
    const currentLinks = getValues('portfolioLinks') || [];
    setValue('portfolioLinks', [...currentLinks, '']);
  };
  
  const removePortfolioLink = (index: number) => {
    const currentLinks = getValues('portfolioLinks') || [];
    setValue('portfolioLinks', currentLinks.filter((_, i) => i !== index));
  };
  
  const updatePortfolioLink = (index: number, value: string) => {
    const currentLinks = getValues('portfolioLinks') || [];
    const updatedLinks = [...currentLinks];
    updatedLinks[index] = value;
    setValue('portfolioLinks', updatedLinks);
  };

  const onFormSubmit = async (data: ProposalFormData) => {
    try {
      console.log('Form submission data:', data);
      
      // Filter out empty portfolio links
      const filteredData = {
        ...data,
        portfolioLinks: (data.portfolioLinks || []).filter(link => link.trim() !== '')
      };
      
      console.log('Filtered data for API:', filteredData);
      
      await onSubmit(filteredData);
      
      toast({
        title: "Proposal Submitted",
        description: "Your proposal has been submitted successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit proposal",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-100">
                Apply for: {job.title}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Submit your proposal to work on this project
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {job.budget?.type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{job.budget?.amount} {job.budget?.currency}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{job.timeline?.duration} {job.timeline?.unit}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Cover Letter */}
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-sm font-medium text-gray-200">
                Cover Letter *
              </Label>
              <Controller
                name="coverLetter"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="coverLetter"
                    placeholder="Explain why you're the perfect fit for this project. Include relevant experience, approach, and what makes you stand out..."
                    className="min-h-[120px] bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    aria-describedby={errors.coverLetter ? 'coverLetter-error' : undefined}
                  />
                )}
              />
              {errors.coverLetter && (
                <p id="coverLetter-error" className="text-sm text-red-400 mt-1" role="alert">
                  {errors.coverLetter.message}
                </p>
              )}
            </div>

            {/* Proposed Rate */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-200">
                Proposed Rate *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposedAmount" className="text-sm font-medium text-gray-200">
                    Amount *
                  </Label>
                  <Controller
                    name="proposedRate.amount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="proposedAmount"
                        type="number"
                        placeholder="Enter amount"
                        className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        aria-describedby={errors.proposedRate?.amount ? 'amount-error' : undefined}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-200">
                    Currency *
                  </Label>
                  <Controller
                    name="proposedRate.currency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="USD" className="text-gray-100 hover:bg-gray-700">USD ($)</SelectItem>
                          <SelectItem value="AVAX" className="text-gray-100 hover:bg-gray-700">AVAX</SelectItem>
                          <SelectItem value="ETH" className="text-gray-100 hover:bg-gray-700">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateType" className="text-sm font-medium text-gray-200">
                    Rate Type *
                  </Label>
                  <Controller
                    name="proposedRate.type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select rate type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="fixed" className="text-gray-100 hover:bg-gray-700">Fixed Price</SelectItem>
                          <SelectItem value="hourly" className="text-gray-100 hover:bg-gray-700">Hourly Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              {(errors.proposedRate?.amount || errors.proposedRate?.currency || errors.proposedRate?.type) && (
                <div className="text-sm text-red-400 mt-1" role="alert">
                  {errors.proposedRate?.amount?.message || 
                   errors.proposedRate?.currency?.message || 
                   errors.proposedRate?.type?.message}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-200">
                Proposed Timeline *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-200">
                    Duration *
                  </Label>
                  <Controller
                    name="timeline.duration"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="duration"
                        type="number"
                        placeholder="Enter duration"
                        className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        min="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        aria-describedby={errors.timeline?.duration ? 'duration-error' : undefined}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeUnit" className="text-sm font-medium text-gray-200">
                    Unit *
                  </Label>
                  <Controller
                    name="timeline.unit"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="days" className="text-gray-100 hover:bg-gray-700">Days</SelectItem>
                          <SelectItem value="weeks" className="text-gray-100 hover:bg-gray-700">Weeks</SelectItem>
                          <SelectItem value="months" className="text-gray-100 hover:bg-gray-700">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              {(errors.timeline?.duration || errors.timeline?.unit) && (
                <div className="text-sm text-red-400 mt-1" role="alert">
                  {errors.timeline?.duration?.message || errors.timeline?.unit?.message}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium text-gray-200">
                Relevant Experience *
              </Label>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="experience"
                    placeholder="Describe your relevant experience, skills, and past projects that make you qualified for this job..."
                    className="min-h-[100px] bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    aria-describedby={errors.experience ? 'experience-error' : undefined}
                  />
                )}
              />
              {errors.experience && (
                <p id="experience-error" className="text-sm text-red-400 mt-1" role="alert">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Portfolio Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-200">
                  Portfolio Links (Optional)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPortfolioLink}
                  className="bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
              
              {portfolioLinks.length > 0 && (
                <div className="space-y-3">
                  {portfolioLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <Input
                        type="url"
                        value={link}
                        onChange={(e) => updatePortfolioLink(index, e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        aria-label={`Portfolio link ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePortfolioLink(index)}
                        className="text-gray-400 hover:text-red-400 hover:bg-gray-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.portfolioLinks && (
                <p className="text-sm text-red-400 mt-1" role="alert">
                  {errors.portfolioLinks.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby="submit-help"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </div>
            <p id="submit-help" className="sr-only">
              Submit your proposal to apply for this job
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalSubmissionForm;
