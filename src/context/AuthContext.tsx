import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, username: string, role: 'reader' | 'writer', bio?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updatePassword: (email: string, newPassword: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Find your useEffect in AuthContext.tsx and replace it with this:
useEffect(() => {
  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      }
    } catch (err) {
      console.error("Initialization error", err);
    } finally {
      setLoading(false);
    }
  };

  initAuth();

  // FIX: Destructure { data: { subscription } } correctly
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      setLoading(true);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, [fetchUserProfile]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Logged in successfully');
    return { error: null };
  };

  const register = async (email: string, password: string, username: string, role: 'reader' | 'writer', bio?: string) => {
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, role, bio } },
    });
    if (authError) {
      toast.error(authError.message);
      return { error: authError };
    }
    toast.success('Account created! Please check your email.');
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out');
  };

  const updatePassword = async (email: string, _newPassword: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Password reset email sent');
    return { error: null };
  };

  // CRITICAL: useMemo stops the infinite loop
  const contextValue = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updatePassword,
  }), [user, loading]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};