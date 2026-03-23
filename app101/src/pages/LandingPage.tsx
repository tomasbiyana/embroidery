import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, PenTool, Users, Star, ChevronRight } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // using user and loading

  useEffect(() => {
    // Wait until auth state is resolved
    if (loading) return;
    
    if (user) {
      // Redirect based on role
      if (user.role === 'writer') {
        navigate('/writer/dashboard');
      } else {
        navigate('/reader/browse');
      }
    }
  }, [user, loading, navigate]);

  // If still loading, show nothing (or a spinner)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* Navigation (same as before) */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StoryVerse
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Where Stories Come to{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Life
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            The ultimate platform for writers and readers. Write novels, episodes, or one-page stories. 
            Subscribe to your favorite authors and unlock exclusive content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/register', { state: { role: 'writer' } })}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8"
            >
              <PenTool className="w-5 h-5 mr-2" />
              Start Writing
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/register', { state: { role: 'reader' } })}
              className="text-lg px-8 border-2"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Reading
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section (unchanged) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Everything You Need to{' '}
            <span className="text-indigo-600">Create & Discover</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PenTool className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Write Your Way</h3>
              <p className="text-gray-600">
                Create novels with chapters, episodic series, or one-page stories. 
                Flexible formats for every type of storyteller.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Build Your Audience</h3>
              <p className="text-gray-600">
                Connect with readers who love your genre. Grow your fanbase 
                and earn through subscriptions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Exclusive Content</h3>
              <p className="text-gray-600">
                Subscribe to unlock premium stories. Support your favorite 
                writers and access content you won't find anywhere else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (unchanged) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            How <span className="text-indigo-600">StoryVerse</span> Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* For Writers */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <PenTool className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Writers</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Create your author account',
                  'Start writing in any format',
                  'Publish and build your audience',
                  'Earn through subscriptions',
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigate('/register', { state: { role: 'writer' } })}
              >
                Become a Writer <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* For Readers */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Readers</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Create your reader account',
                  'Browse stories by genre',
                  'Subscribe to favorite authors',
                  'Read exclusive content anywhere',
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate('/register', { state: { role: 'reader' } })}
              >
                Start Reading <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (unchanged) */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">StoryVerse</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 StoryVerse. Where stories come to life.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}