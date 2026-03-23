import { supabase } from '@/lib/supabase';
import { Book, Chapter, Subscription, User } from '@/types';

// Helper to convert snake_case to camelCase (if your types use camelCase)
// Or you can store/use snake_case consistently.

export const supabaseDb = {
  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data as User[];
  },

  async addUser(user: any) {
    const { error } = await supabase.from('users').insert(user);
    if (error) throw error;
  },

  // Books
  async getBooks(): Promise<Book[]> {
    const { data, error } = await supabase.from('books').select('*');
    if (error) throw error;
    return data.map(book => ({
      id: book.id,
      title: book.title,
      authorId: book.author_id,
      authorName: book.author_name,
      description: book.description,
      type: book.type,
      genre: book.genre,
      createdAt: book.created_at,
      updatedAt: book.updated_at,
      isPublished: book.is_published,
      subscriberCount: book.subscriber_count,
    }));
  },

  async getBookById(id: string): Promise<Book | null> {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
    if (error) return null;
    return { ...data, isPublished: data.is_published, subscriberCount: data.subscriber_count };
  },

  async getBooksByAuthor(authorId: string): Promise<Book[]> {
    const { data, error } = await supabase.from('books').select('*').eq('author_id', authorId);
    if (error) throw error;
    return data.map(book => ({ ...book, isPublished: book.is_published, subscriberCount: book.subscriber_count }));
  },

  async getPublishedBooks(): Promise<Book[]> {
    const { data, error } = await supabase.from('books').select('*').eq('is_published', true);
    if (error) throw error;
    return data.map(book => ({ ...book, isPublished: book.is_published, subscriberCount: book.subscriber_count }));
  },

  async addBook(book: Book) {
    const { error } = await supabase.from('books').insert({
      id: book.id,
      title: book.title,
      author_id: book.authorId,
      author_name: book.authorName,
      description: book.description,
      type: book.type,
      genre: book.genre,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      is_published: book.isPublished,
      subscriber_count: book.subscriberCount,
    });
    if (error) throw error;
  },

  async updateBook(book: Book) {
    const { error } = await supabase.from('books').update({
      title: book.title,
      description: book.description,
      type: book.type,
      genre: book.genre,
      updated_at: new Date().toISOString(),
      is_published: book.isPublished,
      subscriber_count: book.subscriberCount,
    }).eq('id', book.id);
    if (error) throw error;
  },

  async deleteBook(id: string) {
    // Delete chapters first (due to foreign key cascade might handle, but we can do manually if needed)
    const { error: chaptersError } = await supabase.from('chapters').delete().eq('book_id', id);
    if (chaptersError) throw chaptersError;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
  },

  // Chapters
  async getChapters(): Promise<Chapter[]> {
    const { data, error } = await supabase.from('chapters').select('*');
    if (error) throw error;
    return data.map(ch => ({ ...ch, bookId: ch.book_id, chapterNumber: ch.chapter_number, isPublished: ch.is_published, wordCount: ch.word_count }));
  },

  async getChaptersByBook(bookId: string): Promise<Chapter[]> {
    const { data, error } = await supabase.from('chapters').select('*').eq('book_id', bookId).order('chapter_number', { ascending: true });
    if (error) throw error;
    return data.map(ch => ({ ...ch, bookId: ch.book_id, chapterNumber: ch.chapter_number, isPublished: ch.is_published, wordCount: ch.word_count }));
  },

  async getChapterById(id: string): Promise<Chapter | null> {
    const { data, error } = await supabase.from('chapters').select('*').eq('id', id).single();
    if (error) return null;
    return { ...data, bookId: data.book_id, chapterNumber: data.chapter_number, isPublished: data.is_published, wordCount: data.word_count };
  },

  async addChapter(chapter: Chapter) {
    const { error } = await supabase.from('chapters').insert({
      id: chapter.id,
      book_id: chapter.bookId,
      title: chapter.title,
      content: chapter.content,
      chapter_number: chapter.chapterNumber,
      is_published: chapter.isPublished,
      word_count: chapter.wordCount,
      created_at: chapter.createdAt,
      updated_at: chapter.updatedAt,
    });
    if (error) throw error;
  },

  async updateChapter(chapter: Chapter) {
    const { error } = await supabase.from('chapters').update({
      title: chapter.title,
      content: chapter.content,
      is_published: chapter.isPublished,
      word_count: chapter.wordCount,
      updated_at: new Date().toISOString(),
    }).eq('id', chapter.id);
    if (error) throw error;
  },

  async deleteChapter(id: string) {
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) throw error;
  },

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) throw error;
    return data.map(s => ({ id: s.id, readerId: s.reader_id, writerId: s.writer_id, subscribedAt: s.subscribed_at }));
  },

  async getSubscriptionsByReader(readerId: string): Promise<Subscription[]> {
    const { data, error } = await supabase.from('subscriptions').select('*').eq('reader_id', readerId);
    if (error) throw error;
    return data.map(s => ({ id: s.id, readerId: s.reader_id, writerId: s.writer_id, subscribedAt: s.subscribed_at }));
  },

  async getSubscriptionsByWriter(writerId: string): Promise<Subscription[]> {
    const { data, error } = await supabase.from('subscriptions').select('*').eq('writer_id', writerId);
    if (error) throw error;
    return data.map(s => ({ id: s.id, readerId: s.reader_id, writerId: s.writer_id, subscribedAt: s.subscribed_at }));
  },

  async isSubscribed(readerId: string, writerId: string): Promise<boolean> {
    const { data, error } = await supabase.from('subscriptions').select('id').eq('reader_id', readerId).eq('writer_id', writerId).maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async subscribe(subscription: Subscription) {
    // Check if already exists (could use conflict handling in SQL)
    const existing = await this.isSubscribed(subscription.readerId, subscription.writerId);
    if (existing) return;
    const { error } = await supabase.from('subscriptions').insert({
      id: subscription.id,
      reader_id: subscription.readerId,
      writer_id: subscription.writerId,
      subscribed_at: subscription.subscribedAt,
    });
    if (error) throw error;
    // Update subscriber count on all books of that writer (could be done with a trigger, but we'll do manually)
    const { data: books } = await supabase.from('books').select('id').eq('author_id', subscription.writerId);
    if (books && books.length) {
      for (const book of books) {
        await supabase.rpc('increment_subscriber_count', { book_id: book.id }); // create a PostgreSQL function
      }
    }
  },

  async unsubscribe(readerId: string, writerId: string) {
    const { error } = await supabase.from('subscriptions').delete().eq('reader_id', readerId).eq('writer_id', writerId);
    if (error) throw error;
    // Decrement subscriber count
    const { data: books } = await supabase.from('books').select('id').eq('author_id', writerId);
    if (books && books.length) {
      for (const book of books) {
        await supabase.rpc('decrement_subscriber_count', { book_id: book.id });
      }
    }
  },
};