import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseDb } from '@/services/supabaseDb';
import type { Book, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Search, User as UserIcon, LogOut, Heart, Users, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const GENRES = ['All', 'Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Horror', 'Adventure', 'Drama', 'Comedy', 'Poetry'];

export function ReaderBrowsePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [writers, setWriters] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allBooks = await supabaseDb.getPublishedBooks();
      setBooks(allBooks);
      const allUsers = await supabaseDb.getUsers();
      const writerUsers = allUsers.filter(u => u.role === 'writer');
      setWriters(writerUsers);
      if (user) {
        const userSubs = await supabaseDb.getSubscriptionsByReader(user.id);
        setSubscriptions(userSubs.map(s => s.writerId));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (writerId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (subscriptions.includes(writerId)) {
      await supabaseDb.unsubscribe(user.id, writerId);
      setSubscriptions(prev => prev.filter(id => id !== writerId));
    } else {
      await supabaseDb.subscribe({
        id: crypto.randomUUID(),
        readerId: user.id,
        writerId,
        subscribedAt: new Date().toISOString(),
      });
      setSubscriptions(prev => [...prev, writerId]);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const getBookTypeLabel = (type: string) => {
    switch (type) {
      case 'novel': return 'Novel';
      case 'episode': return 'Series';
      case 'onepage': return 'Short';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (same as before) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">StoryVerse</span>
              </button>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">Browse</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">{user?.username}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Amazing Stories</h1>
          <p className="text-gray-600">Browse books from talented writers and subscribe to unlock exclusive content</p>
        </div>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="books" className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Books</TabsTrigger>
            <TabsTrigger value="writers" className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> Writers</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search books or authors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {GENRES.map((genre) => (
                  <button key={genre} onClick={() => setSelectedGenre(genre)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedGenre === genre ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-10 h-10 text-gray-400" /></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
                <p className="text-gray-500">Try a different search or filter</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => {
                  const isSubscribed = subscriptions.includes(book.authorId);
                  return (
                    <Card key={book.id} className="hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/reader/book/${book.id}`)}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-xs">{getBookTypeLabel(book.type)}</Badge>
                          <Badge variant="outline" className="text-xs">{book.genre}</Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{book.description || 'No description'}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1"><UserIcon className="w-4 h-4" /> {book.authorName}</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {0} {book.type === 'episode' ? 'eps' : 'ch'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-sm text-gray-500"><Users className="w-4 h-4" /> {book.subscriberCount || 0} subs</span>
                          <Button size="sm" variant={isSubscribed ? 'outline' : 'default'} onClick={(e) => { e.stopPropagation(); handleSubscribe(book.authorId); }} className={isSubscribed ? '' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}>
                            {isSubscribed ? <><Heart className="w-4 h-4 mr-1 fill-current" /> Subscribed</> : <><Heart className="w-4 h-4 mr-1" /> Subscribe</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="writers">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {writers.map((writer) => {
                const writerBooks = books.filter(b => b.authorId === writer.id);
                const isSubscribed = subscriptions.includes(writer.id);
                const totalSubscribers = writerBooks.reduce((sum, b) => sum + (b.subscriberCount || 0), 0);
                return (
                  <Card key={writer.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-indigo-600">{writer.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{writer.username}</h3>
                            <p className="text-sm text-gray-500">{writerBooks.length} books</p>
                          </div>
                        </div>
                        <Button size="sm" variant={isSubscribed ? 'outline' : 'default'} onClick={() => handleSubscribe(writer.id)} className={isSubscribed ? '' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}>
                          {isSubscribed ? 'Subscribed' : 'Subscribe'}
                        </Button>
                      </div>
                      {writer.bio && <p className="mt-4 text-sm text-gray-600 line-clamp-2">{writer.bio}</p>}
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {totalSubscribers} subscribers</span>
                        <button onClick={() => navigate(`/reader/writer/${writer.id}`)} className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                          View Books <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}