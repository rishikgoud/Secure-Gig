import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { signupSchema, SignupFormData } from '../../schemas/authSchemas';
import { signupUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { networkDebugger } from '../../utils/networkDebugger';

/**
 * Signup form component with comprehensive validation
 * Matches backend User schema exactly for seamless integration
 */
export const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setIsAuthenticated } = useAuthStore();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur'
  });

  const selectedRole = watch('role');

  /**
   * Run network diagnostics to help debug connection issues
   */
  const runNetworkDiagnostics = async () => {
    try {
      const diagnostics = await networkDebugger.runDiagnostics();
      const report = networkDebugger.generateReport(diagnostics);
      
      console.log(report);
      
      toast({
        title: "Network Diagnostics Complete",
        description: "Check browser console for detailed report",
      });
    } catch (error) {
      console.error('Network diagnostics failed:', error);
    }
  };

  /**
   * Handle form submission and user registration
   */
  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    
    try {
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...signupData } = data;
      
      // Convert empty phone to undefined
      if (signupData.phone === '') {
        signupData.phone = undefined;
      }
      
      // Call authentication service
      const response = await signupUser(signupData);
      
      // Update auth store with user data
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Show success message
      toast({
        title: "Account Created Successfully",
        description: `Welcome to SecureGig, ${response.data.user.name}!`,
      });
      
      // Since role is already selected during signup, redirect directly to wallet connection
      // No need for additional role selection step
      navigate('/wallet-connection', { replace: true });
      
    } catch (error: any) {
      console.error('Signup error details:', error);
      
      // Handle registration errors with enhanced debugging
      const errorMessage = error.message || 'Registration failed. Please try again.';
      
      // Set specific field errors for known issues
      if (errorMessage.includes('email already exists')) {
        setError('email', { message: 'An account with this email already exists' });
      } else if (errorMessage.includes('wallet')) {
        setError('root', { message: errorMessage });
      } else if (errorMessage.includes('connect to server') || errorMessage.includes('Network Error')) {
        // Network connectivity issue - show diagnostic option
        setError('root', { 
          message: `${errorMessage}. Click "Run Diagnostics" below to troubleshoot.`
        });
      }
      
      // Show error toast with action button for network issues
      toast({
        title: "Registration Failed",
        description: errorMessage.includes('connect to server') 
          ? "Network connection issue detected. Check console for diagnostics."
          : errorMessage,
        variant: "destructive",
      });
      
      // Auto-run diagnostics for network errors
      if (errorMessage.includes('connect to server') || errorMessage.includes('Network Error')) {
        setTimeout(() => runNetworkDiagnostics(), 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-transparent border-gray-700 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Join SecureGig and start your freelance journey
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={`pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary ${errors.name ? 'border-red-500' : ''}`}
                  {...register('name')}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary ${errors.email ? 'border-red-500' : ''}`}
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className={`pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary ${errors.phone ? 'border-red-500' : ''}`}
                  {...register('phone')}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">I want to</Label>
              <Select onValueChange={(value) => setValue('role', value as 'client' | 'freelancer')} disabled={isLoading}>
                <SelectTrigger className={`bg-gray-800 border-gray-600 text-white focus:border-primary focus:ring-primary ${errors.role ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Choose your role" className="text-gray-400" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="client" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Hire freelancers (Client)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="freelancer" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Find work (Freelancer)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-400">{errors.role.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={`pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary ${errors.password ? 'border-red-500' : ''}`}
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
            <p className="text-xs text-gray-400">
                Must contain at least 8 characters with uppercase, lowercase, and number
              </p>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className={`pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Root Error Display */}
            {errors.root && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-300">{errors.root.message}</p>
                    {errors.root.message?.includes('Run Diagnostics') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 border-gray-600 text-white hover:bg-gray-700"
                        onClick={runNetworkDiagnostics}
                      >
                        Run Network Diagnostics
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </div>
              )}
            </Button>

            {/* Terms and Privacy */}
            <p className="text-xs text-gray-400 text-center">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
            </p>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-300">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
