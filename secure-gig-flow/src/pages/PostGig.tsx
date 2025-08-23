import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Upload, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    budget: '',
    deadline: '',
    category: '',
    experience: '',
    attachments: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate escrow contract call and gig creation
    setTimeout(() => {
      // Save gig data
      const gigData = {
        ...formData,
        id: Date.now().toString(),
        status: 'open',
        createdAt: new Date().toISOString(),
        proposals: []
      };
      
      const existingGigs = JSON.parse(localStorage.getItem('clientGigs') || '[]');
      localStorage.setItem('clientGigs', JSON.stringify([...existingGigs, gigData]));
      
      setIsSubmitting(false);
      navigate('/client-dashboard');
    }, 3000);
  };

  const handleCancel = () => {
    navigate('/client-dashboard');
  };

  const isFormValid = formData.title && formData.description && formData.skills && formData.budget && formData.deadline;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-gradient-primary text-white px-6 py-3">
            <FileText className="h-4 w-4 mr-2" />
            Post New Gig
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">
            Create Your <span className="text-gradient-primary">Project</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your project in detail to attract the best freelancers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-web3 border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <span>Project Details</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Build a React E-commerce Website"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="text-lg py-6"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="text-lg py-6">
                      <SelectValue placeholder="Select project category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="design">Design & Creative</SelectItem>
                      <SelectItem value="marketing">Digital Marketing</SelectItem>
                      <SelectItem value="writing">Writing & Content</SelectItem>
                      <SelectItem value="data-science">Data Science & AI</SelectItem>
                      <SelectItem value="blockchain">Blockchain & Web3</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project requirements, goals, and any specific details freelancers should know..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[200px] text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be as detailed as possible to attract the right talent
                  </p>
                </div>

                {/* Skills Required */}
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills Required *</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., React, Node.js, MongoDB, UI/UX Design"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    className="text-lg py-6"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate skills with commas
                  </p>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level Required</Label>
                  <Select onValueChange={(value) => handleInputChange('experience', value)}>
                    <SelectTrigger className="text-lg py-6">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                      <SelectItem value="any">Any Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card className="card-web3 border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-green-500" />
                  <span>Budget & Timeline</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div className="space-y-2">
                    <Label htmlFor="budget">Project Budget (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="budget"
                        type="number"
                        placeholder="5000"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        className="text-lg py-6 pl-12"
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Project Deadline *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                        className="text-lg py-6 pl-12"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card className="card-web3 border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Upload className="h-6 w-6 text-blue-500" />
                  <span>Project Attachments</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Upload project files, mockups, or reference materials
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>

                {/* Uploaded Files */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files:</Label>
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Escrow Information */}
            <Card className="card-web3 border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-primary">
                  <Lock className="h-6 w-6" />
                  <span>Escrow Protection</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Funds locked in smart contract</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Payment released on completion</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Dispute resolution available</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Project Budget:</span>
                    <span className="font-semibold">${formData.budget || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platform Fee (2%):</span>
                    <span className="font-semibold">${formData.budget ? (parseFloat(formData.budget) * 0.02).toFixed(2) : '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span>Total to Lock:</span>
                    <span>${formData.budget ? (parseFloat(formData.budget) * 1.02).toFixed(2) : '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="card-web3">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <span>Tips for Success</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3 text-sm">
                <p>• Be specific about your requirements</p>
                <p>• Set realistic budgets and deadlines</p>
                <p>• Include examples or references</p>
                <p>• Respond to proposals quickly</p>
                <p>• Communicate clearly with freelancers</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                className="w-full btn-primary text-lg py-6 group"
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Locking Funds & Creating Gig...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Submit & Lock Funds
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="w-full text-lg py-6 border-2"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostGig;
