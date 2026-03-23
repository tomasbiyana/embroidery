import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseDb } from '@/services/supabaseDb';
import type { Book, Chapter } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Plus, MoreVertical, Edit, Trash2, Eye, EyeOff, 
  FileText, Calendar, Save 
} from 'lucide-react';

export function BookManagePage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState<Partial<Book>>({});

  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isDeleteChapterDialogOpen, setIsDeleteChapterDialogOpen] = useState(false);

  useEffect(() => {
    if (bookId) {
      loadBookData();
    }
  }, [bookId]);

  const loadBookData = async () => {
    setLoading(true);
    const bookData = await supabaseDb.getBookById(bookId!);
    if (bookData) {
      setBook(bookData);
      setEditedBook(bookData);
      const chaptersData = await supabaseDb.getChaptersByBook(bookId!);
      setChapters(chaptersData);
    }
    setLoading(false);
  };

  const handleSaveBook = async () => {
    if (book && editedBook) {
      const updatedBook = { ...book, ...editedBook, updatedAt: new Date().toISOString() };
      await supabaseDb.updateBook(updatedBook);
      setBook(updatedBook);
      setIsEditing(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (selectedChapter) {
      await supabaseDb.deleteChapter(selectedChapter.id);
      setIsDeleteChapterDialogOpen(false);
      setSelectedChapter(null);
      await loadBookData();
    }
  };

  const toggleChapterPublish = async (chapter: Chapter) => {
    const updatedChapter = { ...chapter, isPublished: !chapter.isPublished, updatedAt: new Date().toISOString() };
    await supabaseDb.updateChapter(updatedChapter);
    await loadBookData();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'novel': return 'Novel';
      case 'episode': return 'Episodic Series';
      case 'onepage': return 'One-Page Story';
      default: return type;
    }
  };

  const getNextChapterNumber = () => {
    if (chapters.length === 0) return 1;
    return Math.max(...chapters.map(c => c.chapterNumber)) + 1;
  };
  if (loading) return <div>Loading...</div>;
  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Book not found</p>
          <Button onClick={() => navigate('/writer/dashboard')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/writer/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-900 truncate max-w-xs">{book.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/writer/book/${book.id}/write`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New {book.type === 'episode' ? 'Episode' : 'Chapter'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Book Details</CardTitle>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editedBook.title || ''}
                        onChange={(e) => setEditedBook({ ...editedBook, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        value={editedBook.description || ''}
                        onChange={(e) => setEditedBook({ ...editedBook, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <select
                        value={editedBook.genre || 'Fantasy'}
                        onChange={(e) => setEditedBook({ ...editedBook, genre: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Horror', 'Adventure', 'Drama', 'Comedy', 'Poetry', 'Other'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600" onClick={handleSaveBook}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Title</p>
                      <p className="font-medium">{book.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-700">{book.description || 'No description'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Type</p>
                        <Badge variant="secondary">{getTypeLabel(book.type)}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Genre</p>
                        <Badge variant="outline">{book.genre}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <Badge variant={book.isPublished ? 'default' : 'secondary'}>
                          {book.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Subscribers</p>
                        <p className="font-medium">{book.subscriberCount || 0}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Created</p>
                      <p className="text-sm text-gray-700">
                        {new Date(book.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total {book.type === 'episode' ? 'Episodes' : 'Chapters'}</span>
                    <span className="font-medium">{chapters.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium">{chapters.filter(c => c.isPublished).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drafts</span>
                    <span className="font-medium">{chapters.filter(c => !c.isPublished).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Words</span>
                    <span className="font-medium">
                      {chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapters List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {book.type === 'episode' ? 'Episodes' : 'Chapters'} ({chapters.length})
                  </CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/writer/book/${book.id}/write`, { state: { chapterNumber: getNextChapterNumber() } })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {chapters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No {book.type === 'episode' ? 'episodes' : 'chapters'} yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start writing your first {book.type === 'episode' ? 'episode' : 'chapter'}
                    </p>
                    <Button 
                      onClick={() => navigate(`/writer/book/${book.id}/write`)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start Writing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chapters.map((chapter) => (
                      <div 
                        key={chapter.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="font-bold text-indigo-600">{chapter.chapterNumber}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(chapter.updatedAt).toLocaleDateString()}
                              </span>
                              <span>{(chapter.wordCount || 0).toLocaleString()} words</span>
                              <Badge variant={chapter.isPublished ? 'default' : 'secondary'} className="text-xs">
                                {chapter.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleChapterPublish(chapter)}
                          >
                            {chapter.isPublished ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/writer/book/${book.id}/write/${chapter.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedChapter(chapter);
                                  setIsDeleteChapterDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Chapter Dialog */}
      <Dialog open={isDeleteChapterDialogOpen} onOpenChange={setIsDeleteChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {book.type === 'episode' ? 'Episode' : 'Chapter'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedChapter?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteChapterDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChapter}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
