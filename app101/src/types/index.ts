// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'writer' | 'reader';
  createdAt: string;
  securityQuestion: string;
  securityAnswer: string;
  bio?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string, answer: string, newPassword: string) => Promise<boolean>;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role: 'writer' | 'reader';
  securityQuestion: string;
  securityAnswer: string;
  bio?: string;
}

// Book Types
export type BookType = 'novel' | 'episode' | 'onepage';

export interface Book {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  description: string;
  type: BookType;
  genre: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  chapters?: Chapter[];
  subscriberCount: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  chapterNumber: number;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  wordCount: number;
}

// Subscription Types
export interface Subscription {
  id: string;
  readerId: string;
  writerId: string;
  bookId?: string;
  subscribedAt: string;
}

// Reading Progress
export interface ReadingProgress {
  readerId: string;
  bookId: string;
  chapterId: string;
  progress: number;
  lastReadAt: string;
}
