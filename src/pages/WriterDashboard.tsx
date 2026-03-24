import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseDb } from '@/services/supabaseDb';
import type { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, MoreVertical, Edit, Trash2, Eye, EyeOff, Users, FileText, LogOut, Search } from 'lucide-react';
import { toast } from 'sonner';

const BOOK_TYPES = [
  { value: 'novel', label: 'Novel (Chapters)', icon: BookOpen },
  { value: 'episode', label: 'Episodic Series', icon: FileText },
  { value: 'onepage', label: 'One-Page Story', icon: FileText },
];

const GENRES = ['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Horror', 'Adventure', 'Drama', 'Comedy', 'Poetry', 'Other'];

export function WriterDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    description: '',
    type: 'novel' as const,
    genre: 'Fantasy',
  });

useEffect(() => {
  if (user) {
    loadBooks();
  } else {
    // If user is null (not logged in), still stop loading
    setLoading(false);
  }
}, [user]);

const loadBooks = async () => {
  setLoading(true);
  try {
    if (user) {
      const userBooks = await supabaseDb.getBooksByAuthor(user.id);
      setBooks(userBooks);
    } else {
      console.log('No user logged in');
    }
  } catch (error) {
    console.error('Error loading books:', error);
    toast.error('Failed to load your books. Please refresh the page.');
  } finally {
    setLoading(false);
  }
};

const handleCreateBook = async () => {
  if (!newBook.title.trim() || !user) {
    toast.error('Please enter a title');
    return;
  }

  console.log('Creating book with user:', user); // 👈 log user object
  const book: Book = {
    id: crypto.randomUUID(),
    title: newBook.title,
    authorId: user.id,
    authorName: user.username,
    description: newBook.description,
    type: newBook.type,
    genre: newBook.genre,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: false,
    subscriberCount: 0,
  };
  console.log('Book to insert:', book); // 👈 log book data

  try {
    await supabaseDb.addBook(book);
    toast.success('Book created!');
    setNewBook({ title: '', description: '', type: 'novel', genre: 'Fantasy' });
    setIsCreateDialogOpen(false);
    await loadBooks();
  } catch (error) {
    console.error('Supabase error:', error); // 👈 log the full error
    toast.error('Failed to create book');
  }
};

  const handleDeleteBook = async () => {
    if (selectedBook) {
      try {
        await supabaseDb.deleteBook(selectedBook.id);
        toast.success('Book deleted');
        setIsDeleteDialogOpen(false);
        setSelectedBook(null);
        await loadBooks();
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  const togglePublishStatus = async (book: Book) => {
    try {
      const updatedBook = { ...book, isPublished: !book.isPublished, updatedAt: new Date().toISOString() };
      await supabaseDb.updateBook(updatedBook);
      toast.success(book.isPublished ? 'Book unpublished' : 'Book published');
      await loadBooks();
    } catch (error) {
      toast.error('Failed to update book');
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSubscribers = books.reduce((sum, book) => sum + (book.subscriberCount || 0), 0);
  const totalChapters = 0; // placeholder
  const publishedBooks = books.filter(b => b.isPublished).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <span className="text-gray-600 font-medium">Writer Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">{user.username}</span>
              <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Books</p><p className="text-3xl font-bold">{books.length}</p></div><div className="bg-indigo-100 p-3 rounded-lg"><BookOpen className="w-6 h-6 text-indigo-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Published</p><p className="text-3xl font-bold">{publishedBooks}</p></div><div className="bg-green-100 p-3 rounded-lg"><Eye className="w-6 h-6 text-green-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Chapters</p><p className="text-3xl font-bold">{totalChapters}</p></div><div className="bg-purple-100 p-3 rounded-lg"><FileText className="w-6 h-6 text-purple-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Subscribers</p><p className="text-3xl font-bold">{totalSubscribers}</p></div><div className="bg-pink-100 p-3 rounded-lg"><Users className="w-6 h-6 text-pink-600" /></div></div></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search your books..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"><Plus className="w-4 h-4 mr-2" /> New Book</Button>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-16"><div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-10 h-10 text-gray-400" /></div><h3 className="text-xl font-semibold text-gray-900 mb-2">{searchQuery ? 'No books found' : 'No books yet'}</h3><p className="text-gray-500 mb-6">{searchQuery ? 'Try a different search term' : 'Start your writing journey by creating your first book'}</p>{!searchQuery && <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600"><Plus className="w-4 h-4 mr-2" /> Create Your First Book</Button>}</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => {
              const chaptersCount = 0; // placeholder
              return (
                <Card key={book.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant={book.isPublished ? 'default' : 'secondary'} className="mb-2">{book.isPublished ? 'Published' : 'Draft'}</Badge>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => togglePublishStatus(book)}>{book.isPublished ? <><EyeOff className="w-4 h-4 mr-2" /> Unpublish</> : <><Eye className="w-4 h-4 mr-2" /> Publish</>}</DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedBook(book); setIsDeleteDialogOpen(true); }} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{book.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4"><span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {chaptersCount} {book.type === 'episode' ? 'episodes' : 'chapters'}</span><span className="flex items-center gap-1"><Users className="w-4 h-4" /> {book.subscriberCount || 0} subscribers</span></div>
                    <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => navigate(`/writer/book/${book.id}`)}><Edit className="w-4 h-4 mr-2" /> Manage</Button><Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600" onClick={() => navigate(`/writer/book/${book.id}/write`)}><Plus className="w-4 h-4 mr-2" /> Write</Button></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create New Book</DialogTitle><DialogDescription>Start a new writing project</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" placeholder="Enter book title" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><textarea id="description" placeholder="What's your book about?" value={newBook.description} onChange={(e) => setNewBook({ ...newBook, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="type">Format</Label><select id="type" value={newBook.type} onChange={(e) => setNewBook({ ...newBook, type: e.target.value as any })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">{BOOK_TYPES.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}</select></div>
              <div className="space-y-2"><Label htmlFor="genre">Genre</Label><select id="genre" value={newBook.genre} onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">{GENRES.map((genre) => (<option key={genre} value={genre}>{genre}</option>))}</select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateBook} disabled={!newBook.title.trim()} className="bg-gradient-to-r from-indigo-600 to-purple-600">Create Book</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Delete Book</DialogTitle><DialogDescription>Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteBook}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}