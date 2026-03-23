import { supabase } from '@/lib/supabase';
import type { Book, Chapter, Subscription, User } from '@/types';

// Helper to convert snake_case to camelCase
const mapBook = (book: any): Book => ({
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
});

const mapChapter = (chapter: any): Chapter => ({
  id: chapter.id,
  bookId: chapter.book_id,
  title: chapter.title,
  content: chapter.content,
  chapterNumber: chapter.chapter_number,
  createdAt: chapter.created_at,
  updatedAt: chapter.updated_at,
  isPublished: chapter.is_published,
  wordCount: chapter.word_count,
});

const mapSubscription = (sub: any): Subscription => ({
  id: sub.id,
  readerId: sub.reader_id,
  writerId: sub.writer_id,
  subscribedAt: sub.subscribed_at,
});

const mapUser = (user: any): User => ({
  id: user.id,
  email: user.email, // Not stored in public.users; you may want to fetch from auth.users separately
  username: user.username,
  role: user.role,
  createdAt: user.created_at,
  bio: user.bio,
});

export const supabaseDb = {
  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data.map(mapUser);
  },

  async addUser(user: any) {
    const { error } = await supabase.from('users').insert(user);
    if (error) throw error;
  },

  // Books
  async getBooks(): Promise<Book[]> {
    const { data, error } = await supabase.from('books').select('*');
    if (error) throw error;
    return data.map(mapBook);
  },

  async getBookById(id: string): Promise<Book | null> {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
    if (error) return null;
    return mapBook(data);
  },

  async getBooksByAuthor(authorId: string): Promise<Book[]> {
    const { data, error } = await supabase.from('books').select('*').eq('author_id', authorId);
    if (error) throw error;
    return data.map(mapBook);
  },

  async getPublishedBooks(): Promise<Book[]> {
    const { data, error } = await supabase.from('books').select('*').eq('is_published', true);
    if (error) throw error;
    return data.map(mapBook);
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
    const { error } = await supabase
      .from('books')
      .update({
        title: book.title,
        description: book.description,
        type: book.type,
        genre: book.genre,
        updated_at: new Date().toISOString(),
        is_published: book.isPublished,
        subscriber_count: book.subscriberCount,
      })
      .eq('id', book.id);
    if (error) throw error;
  },

  async deleteBook(id: string) {
    // Chapters will cascade delete due to foreign key, but we can delete them explicitly if needed
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
  },

  // Chapters
  async getChapters(): Promise<Chapter[]> {
    const { data, error } = await supabase.from('chapters').select('*');
    if (error) throw error;
    return data.map(mapChapter);
  },

  async getChaptersByBook(bookId: string): Promise<Chapter[]> {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true });
    if (error) throw error;
    return data.map(mapChapter);
  },

  async getChapterById(id: string): Promise<Chapter | null> {
    const { data, error } = await supabase.from('chapters').select('*').eq('id', id).single();
    if (error) return null;
    return mapChapter(data);
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
    const { error } = await supabase
      .from('chapters')
      .update({
        title: chapter.title,
        content: chapter.content,
        is_published: chapter.isPublished,
        word_count: chapter.wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chapter.id);
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
    return data.map(mapSubscription);
  },

  async getSubscriptionsByReader(readerId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('reader_id', readerId);
    if (error) throw error;
    return data.map(mapSubscription);
  },

  async getSubscriptionsByWriter(writerId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('writer_id', writerId);
    if (error) throw error;
    return data.map(mapSubscription);
  },

  async isSubscribed(readerId: string, writerId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('reader_id', readerId)
      .eq('writer_id', writerId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async subscribe(subscription: Subscription) {
    const exists = await this.isSubscribed(subscription.readerId, subscription.writerId);
    if (exists) return;

    const { error } = await supabase.from('subscriptions').insert({
      id: subscription.id,
      reader_id: subscription.readerId,
      writer_id: subscription.writerId,
      subscribed_at: subscription.subscribedAt,
    });
    if (error) throw error;

    // Update subscriber count on all books of that writer
    const { data: books } = await supabase
      .from('books')
      .select('id')
      .eq('author_id', subscription.writerId);
    if (books) {
      for (const book of books) {
        await supabase.rpc('increment_subscriber_count', { book_id: book.id });
      }
    }
  },

  async unsubscribe(readerId: string, writerId: string) {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('reader_id', readerId)
      .eq('writer_id', writerId);
    if (error) throw error;

    // Decrement subscriber count
    const { data: books } = await supabase
      .from('books')
      .select('id')
      .eq('author_id', writerId);
    if (books) {
      for (const book of books) {
        await supabase.rpc('decrement_subscriber_count', { book_id: book.id });
      }
    }
  },
};