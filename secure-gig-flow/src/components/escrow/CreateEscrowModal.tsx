import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Plus, AlertCircle, DollarSign, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateEscrowModalProps {
  onCreateEscrow: (freelancer: string, amount: string, deadline: number, description: string) => Promise<boolean>;
  isLoading?: boolean;
  trigger?: React.ReactNode;
}

export const CreateEscrowModal = ({ 
  onCreateEscrow, 
  isLoading = false,
  trigger 
}: CreateEscrowModalProps) => {
  const [open, setOpen] = useState(false);
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate freelancer address
    if (!freelancerAddress.trim()) {
      newErrors.freelancer = 'Freelancer address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(freelancerAddress.trim())) {
      newErrors.freelancer = 'Invalid Ethereum address format';
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      } else if (numAmount > 1000) {
        newErrors.amount = 'Amount cannot exceed 1000 AVAX';
      }
    }

    // Validate deadline
    if (!deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (deadline <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    } else if (deadline.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      newErrors.deadline = 'Deadline must be at least 24 hours from now';
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const deadlineTimestamp = Math.floor(deadline!.getTime() / 1000);
    const success = await onCreateEscrow(
      freelancerAddress.trim(),
      amount.trim(),
      deadlineTimestamp,
      description.trim()
    );

    if (success) {
      // Reset form
      setFreelancerAddress('');
      setAmount('');
      setDeadline(undefined);
      setDescription('');
      setErrors({});
      setOpen(false);
    }
  };

  const resetForm = () => {
    setFreelancerAddress('');
    setAmount('');
    setDeadline(undefined);
    setDescription('');
    setErrors({});
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Create Escrow
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Create New Escrow
          </DialogTitle>
          <DialogDescription>
            Set up a secure escrow contract with a freelancer. Funds will be held safely until work is completed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Freelancer Address */}
          <div className="space-y-2">
            <Label htmlFor="freelancer" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Freelancer Address
            </Label>
            <Input
              id="freelancer"
              placeholder="0x..."
              value={freelancerAddress}
              onChange={(e) => setFreelancerAddress(e.target.value)}
              className={cn(errors.freelancer && "border-red-500")}
            />
            {errors.freelancer && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {errors.freelancer}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount (AVAX)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max="1000"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(errors.amount && "border-red-500")}
            />
            {errors.amount && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {errors.amount}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Deadline
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground",
                    errors.deadline && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={(date) => date <= new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {errors.deadline}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Project Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the work to be completed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(
                "min-h-[100px] resize-none",
                errors.description && "border-red-500"
              )}
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{description.length}/500 characters</span>
            </div>
            {errors.description && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {errors.description}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Summary */}
          {freelancerAddress && amount && deadline && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Summary:</strong> {amount} AVAX will be locked in escrow until{' '}
                {format(deadline, "PPP")} for work completion.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Escrow'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
