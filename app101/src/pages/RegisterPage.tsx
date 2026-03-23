import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookOpen, Eye, EyeOff, Loader2, User, PenTool } from 'lucide-react';

const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your mother\'s maiden name?',
  'What was your first car?',
  'What is your favorite book?',
  'What was the name of your elementary school?',
];

export function RegisterPage() {
  useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const defaultRole = location.state?.role || 'reader';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.securityAnswer.trim()) {
      setError('Please provide an answer to your security question');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'writer' | 'reader',
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        bio: formData.bio,
      });

      if (success) {
        window.location.href = '/';
      } else {
        setError('Email already exists');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
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
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Join our community of writers and readers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>I want to be a...</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="reader"
                      id="reader"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="reader"
                      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 cursor-pointer transition-all"
                    >
                      <User className="w-6 h-6 mb-2 text-purple-600" />
                      <span className="font-semibold">Reader</span>
                      <span className="text-xs text-gray-500">Read stories</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="writer"
                      id="writer"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="writer"
                      className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:bg-indigo-50 cursor-pointer transition-all"
                    >
                      <PenTool className="w-6 h-6 mb-2 text-indigo-600" />
                      <span className="font-semibold">Writer</span>
                      <span className="text-xs text-gray-500">Write stories</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              {/* Security Question */}
              <div className="space-y-2">
                <Label htmlFor="securityQuestion">Security Question</Label>
                <select
                  id="securityQuestion"
                  value={formData.securityQuestion}
                  onChange={(e) => handleChange('securityQuestion', e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {SECURITY_QUESTIONS.map((q, i) => (
                    <option key={i} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityAnswer">Security Answer</Label>
                <Input
                  id="securityAnswer"
                  placeholder="Your answer (used for password recovery)"
                  value={formData.securityAnswer}
                  onChange={(e) => handleChange('securityAnswer', e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
