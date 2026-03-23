import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

type Step = 'email' | 'verify' | 'reset' | 'success';

export function ForgotPasswordPage() {
  const { getSecurityQuestion, resetPassword } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const question = getSecurityQuestion(email);
    if (question) {
      setSecurityQuestion(question);
      setStep('verify');
    } else {
      setError('No account found with this email');
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!securityAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }

    setStep('reset');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const success = await resetPassword(email, securityAnswer, newPassword);
      if (success) {
        setStep('success');
      } else {
        setError('Security answer is incorrect');
        setStep('verify');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Continue
            </Button>
          </form>
        );

      case 'verify':
        return (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Security Question:</p>
              <p className="font-medium text-gray-900">{securityQuestion}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Input
                id="answer"
                placeholder="Enter your answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="flex-1 h-11"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Verify
              </Button>
            </div>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setStep('verify')}
                className="flex-1 h-11"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          </form>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful!</h3>
              <p className="text-gray-600">
                Your password has been reset. You can now sign in with your new password.
              </p>
            </div>
            <Link to="/login">
              <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Go to Sign In
              </Button>
            </Link>
          </div>
        );
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Password';
      case 'verify':
        return 'Verify Identity';
      case 'reset':
        return 'Reset Password';
      case 'success':
        return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Enter your email to verify your identity';
      case 'verify':
        return 'Answer your security question';
      case 'reset':
        return 'Create a new password';
      case 'success':
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              StoryVerse
            </span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          {step !== 'success' && (
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">{getStepTitle()}</CardTitle>
              <CardDescription className="text-center">{getStepDescription()}</CardDescription>
            </CardHeader>
          )}
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStep()}

            {step === 'email' && (
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Remember your password? </span>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
