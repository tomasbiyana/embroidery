import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, username: string, role: 'reader' | 'writer', bio?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updatePassword: (email: string, newPassword: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from public.users table
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data as User;
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUser(profile);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile || null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Logged in successfully');
    return { error: null };
  };

  const register = async (email: string, password: string, username: string, role: 'reader' | 'writer', bio?: string) => {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, role }, // optional, but we store in public.users anyway
      },
    });
    if (authError) {
      toast.error(authError.message);
      return { error: authError };
    }

    // 2. Create profile in public.users
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user!.id,
      username,
      role,
      bio,
      // security_question, security_answer if needed
    });
    if (profileError) {
      toast.error(profileError.message);
      return { error: profileError };
    }

    toast.success('Account created! Please check your email to confirm.');
    return { error: null };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out');
    }
  };

  const updatePassword = async (email: string, newPassword: string) => {
    // For password reset, use supabase.auth.resetPasswordForEmail(email)
    // This method is a placeholder; we recommend using the built-in flow.
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Password reset email sent');
    return { error: null };
  };

  const value = { user, loading, login, register, logout, updatePassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};