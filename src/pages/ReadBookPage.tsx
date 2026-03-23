import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseDb } from '@/services/supabaseDb';
import type { Book, Chapter, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, BookOpen, User as UserIcon, Heart, Users, 
  ChevronLeft, ChevronRight, Lock, CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ReadBookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  

  useEffect(() => {
    if (bookId) {
      loadData();
    }
  }, [bookId, user]);

  const loadData = async () => {
    setLoading(true);
    const bookData = await supabaseDb.getBookById(bookId!);
    if (bookData) {
      setBook(bookData);

      // Load chapters
      const chaptersData = await supabaseDb.getChaptersByBook(bookId!);
      const publishedChapters = chaptersData.filter(c => c.isPublished);
      setChapters(publishedChapters);
      if (publishedChapters.length > 0) setCurrentChapter(publishedChapters[0]);

      // Load author
      const users = await supabaseDb.getUsers();
      const authorData = users.find(u => u.id === bookData.authorId);
      if (authorData) setAuthor(authorData);

      // Check subscription
      if (user) {
        const subscribed = await supabaseDb.isSubscribed(user.id, bookData.authorId);
        setIsSubscribed(subscribed);
      }
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!book) return;

    if (isSubscribed) {
      await supabaseDb.unsubscribe(user.id, book.authorId);
      setIsSubscribed(false);
    } else {
      await supabaseDb.subscribe({
        id: crypto.randomUUID(),
        readerId: user.id,
        writerId: book.authorId,
        subscribedAt: new Date().toISOString(),
      });
      setIsSubscribed(true);
    }
    setShowSubscribeDialog(false);
  };

  const goToChapter = (index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapter(chapters[index]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getCurrentChapterIndex = () => {
    return chapters.findIndex(c => c.id === currentChapter?.id);
  };

  const canReadContent = () => {
    if (!book || !user) return false;
    // Writers can always read their own content
    if (book.authorId === user.id) return true;
    // Subscribers can read
    return isSubscribed;
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Book not found</p>
          <Button onClick={() => navigate('/reader/browse')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  const canRead = canReadContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/reader/browse')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse
              </Button>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-900 truncate max-w-xs">{book.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {!canRead && (
                <Button 
                  size="sm"
                  onClick={() => setShowSubscribeDialog(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Subscribe to Read
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!canRead ? (
          // Preview / Locked View
          <div className="space-y-8">
            {/* Book Info */}
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
                <p className="text-gray-600 mb-6 max-w-xl mx-auto">{book.description}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
                  <Badge variant="secondary">{book.genre}</Badge>
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {book.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {chapters.length} {book.type === 'episode' ? 'episodes' : 'chapters'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {book.subscriberCount || 0} subscribers
                  </span>
                </div>
                <Button 
                  size="lg"
                  onClick={() => setShowSubscribeDialog(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Subscribe to Read
                </Button>
              </CardContent>
            </Card>

            {/* Chapter List Preview */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {book.type === 'episode' ? 'Episodes' : 'Chapters'} ({chapters.length})
                </h3>
                <div className="space-y-2">
                  {chapters.slice(0, 3).map((chapter) => (
                    <div 
                      key={chapter.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="font-bold text-indigo-600">{chapter.chapterNumber}</span>
                        </div>
                        <span className="font-medium">{chapter.title}</span>
                      </div>
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                  {chapters.length > 3 && (
                    <p className="text-center text-gray-500 py-4">
                      +{chapters.length - 3} more {book.type === 'episode' ? 'episodes' : 'chapters'} locked
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Author Info */}
            {author && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">
                        {author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{author.username}</h3>
                      <p className="text-sm text-gray-600">{author.bio || 'Writer on StoryVerse'}</p>
                    </div>
                    <Button
                      variant={isSubscribed ? 'outline' : 'default'}
                      onClick={handleSubscribe}
                      className={isSubscribed ? '' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}
                    >
                      {isSubscribed ? (
                        <><CheckCircle className="w-4 h-4 mr-2" /> Subscribed</>
                      ) : (
                        <><Heart className="w-4 h-4 mr-2" /> Subscribe</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Full Reading View
          <div className="space-y-6">
            {/* Chapter Navigation */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <Button
                variant="ghost"
                disabled={getCurrentChapterIndex() === 0}
                onClick={() => goToChapter(getCurrentChapterIndex() - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="text-center">
                <select
                  value={currentChapter?.id}
                  onChange={(e) => {
                    const chapter = chapters.find(c => c.id === e.target.value);
                    if (chapter) setCurrentChapter(chapter);
                  }}
                  className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {book.type === 'episode' ? 'Episode' : 'Chapter'} {chapter.chapterNumber}: {chapter.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="ghost"
                disabled={getCurrentChapterIndex() === chapters.length - 1}
                onClick={() => goToChapter(getCurrentChapterIndex() + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Chapter Content */}
            {currentChapter && (
              <Card className="shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <p className="text-sm text-gray-500 mb-2">
                        {book.type === 'episode' ? 'Episode' : 'Chapter'} {currentChapter.chapterNumber}
                      </p>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {currentChapter.title}
                      </h1>
                      <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          {book.authorName}
                        </span>
                        <span>{(currentChapter.wordCount || 0).toLocaleString()} words</span>
                      </div>
                    </div>

                    <div 
                      className="prose prose-lg max-w-none font-serif leading-relaxed text-gray-800"
                      dangerouslySetInnerHTML={{ __html: currentChapter.content || '<p>No content yet.</p>' }}
                    />

                    <div className="mt-12 pt-8 border-t text-center">
                      <p className="text-gray-500 mb-4">Enjoying the story?</p>
                      <Button
                        variant={isSubscribed ? 'outline' : 'default'}
                        onClick={handleSubscribe}
                        className={isSubscribed ? '' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}
                      >
                        {isSubscribed ? (
                          <><CheckCircle className="w-4 h-4 mr-2" /> Subscribed</>
                        ) : (
                          <><Heart className="w-4 h-4 mr-2" /> Subscribe to Author</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chapter Navigation Bottom */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                disabled={getCurrentChapterIndex() === 0}
                onClick={() => goToChapter(getCurrentChapterIndex() - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous {book.type === 'episode' ? 'Episode' : 'Chapter'}
              </Button>
              <Button
                variant="outline"
                disabled={getCurrentChapterIndex() === chapters.length - 1}
                onClick={() => goToChapter(getCurrentChapterIndex() + 1)}
              >
                Next {book.type === 'episode' ? 'Episode' : 'Chapter'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {book.authorName}</DialogTitle>
            <DialogDescription>
              Subscribe to unlock all content from this author and support their work.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="font-bold text-indigo-600">
                    {book.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{book.authorName}</p>
                  <p className="text-sm text-gray-500">
                    {allBooks.filter((b: Book) => b.authorId === book.authorId).length} books
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Access all published content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Get notified of new releases
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Support your favorite author
                </li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowSubscribeDialog(false)}>
              Maybe Later
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
              onClick={handleSubscribe}
            >
              <Heart className="w-4 h-4 mr-2" />
              Subscribe Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
