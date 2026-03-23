import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabaseDb } from '@/services/supabaseDb';
import type { Book, Chapter } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Save, Type, Clock, CheckCircle,
  Bold, Italic, Underline, AlignLeft
} from 'lucide-react';
import { toast } from 'sonner';

export function WritePage() {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // not used but kept for consistency
  
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Partial<Chapter>>({
    title: '',
    content: '',
    isPublished: false,
    chapterNumber: location.state?.chapterNumber || 1,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load book and chapter data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (bookId) {
        const bookData = await supabaseDb.getBookById(bookId);
        if (bookData) {
          setBook(bookData);
        } else {
          toast.error('Book not found');
          navigate('/writer/dashboard');
          return;
        }
      }
      
      if (chapterId) {
        const chapterData = await supabaseDb.getChapterById(chapterId);
        if (chapterData) {
          setChapter(chapterData);
          setWordCount(chapterData.wordCount || 0);
        } else {
          toast.error('Chapter not found');
          navigate(`/writer/book/${bookId}`);
          return;
        }
      }
      setLoading(false);
    };
    
    loadData();
  }, [bookId, chapterId, navigate]);

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setChapter(prev => ({ ...prev, content }));
    setWordCount(countWords(content));
  };

  const handleSave = useCallback(async (showNotification = true) => {
    if (!bookId || !chapter.title?.trim()) {
      if (showNotification) toast.error('Please enter a title');
      return;
    }

    setIsSaving(true);

    const chapterData: Chapter = {
      id: chapterId || crypto.randomUUID(),
      bookId,
      title: chapter.title || '',
      content: chapter.content || '',
      chapterNumber: chapter.chapterNumber || 1,
      isPublished: chapter.isPublished || false,
      wordCount,
      createdAt: chapter.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (chapterId) {
        await supabaseDb.updateChapter(chapterData);
      } else {
        await supabaseDb.addChapter(chapterData);
      }
      
      setLastSaved(new Date());
      if (showNotification) toast.success('Saved');
      
      // If this is a new chapter and we just saved, update URL to edit mode
      if (showNotification && !chapterId) {
        navigate(`/writer/book/${bookId}/write/${chapterData.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save chapter');
    } finally {
      setIsSaving(false);
    }
  }, [bookId, chapter, chapterId, wordCount, navigate]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (chapterId && chapter.title) {
      const interval = setInterval(() => {
        handleSave(false);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [chapterId, chapter, handleSave]);

  const insertFormatting = (tag: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = chapter.content || '';
    const selected = content.substring(start, end);
    
    let formatted = '';
    switch (tag) {
      case 'b':
        formatted = `<strong>${selected}</strong>`;
        break;
      case 'i':
        formatted = `<em>${selected}</em>`;
        break;
      case 'u':
        formatted = `<u>${selected}</u>`;
        break;
      case 'p':
        formatted = `<p>${selected || 'New paragraph'}</p>`;
        break;
      case 'br':
        formatted = `${selected}<br/>`;
        break;
      default:
        formatted = selected;
    }

    const newContent = content.substring(0, start) + formatted + content.substring(end);
    setChapter(prev => ({ ...prev, content: newContent }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Book not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/writer/book/${bookId}`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 truncate max-w-xs">{book.title}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">
                  {chapterId ? 'Edit' : 'New'} {book.type === 'episode' ? 'Episode' : 'Chapter'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={chapter.isPublished}
                  onCheckedChange={(checked) => setChapter(prev => ({ ...prev, isPublished: checked }))}
                />
                <span className="text-sm text-gray-600">
                  {chapter.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <Button 
                onClick={() => handleSave()}
                disabled={isSaving || !chapter.title?.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isSaving ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Chapter Info */}
            <div className="grid grid-cols-12 gap-4 mb-6">
              <div className="col-span-2">
                <Label>Number</Label>
                <Input
                  type="number"
                  value={chapter.chapterNumber}
                  onChange={(e) => setChapter(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) || 1 }))}
                  min={1}
                  className="mt-1"
                />
              </div>
              <div className="col-span-10">
                <Label>Title *</Label>
                <Input
                  placeholder={`Enter ${book.type === 'episode' ? 'episode' : 'chapter'} title`}
                  value={chapter.title}
                  onChange={(e) => setChapter(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg mb-4 border">
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('b')} title="Bold">
                <Bold className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('i')} title="Italic">
                <Italic className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('u')} title="Underline">
                <Underline className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('p')} title="Paragraph">
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('br')} title="Line Break">
                <Type className="w-4 h-4" />
              </Button>
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea
                id="content"
                placeholder="Start writing your story here..."
                value={chapter.content}
                onChange={handleContentChange}
                rows={20}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-serif text-lg"
              />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Type className="w-4 h-4" />
                  {wordCount.toLocaleString()} words
                </span>
                <span>
                  {(chapter.content || '').length.toLocaleString()} characters
                </span>
              </div>
              <Badge variant={chapter.isPublished ? 'default' : 'secondary'}>
                {chapter.isPublished ? 'Will be published' : 'Saved as draft'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}