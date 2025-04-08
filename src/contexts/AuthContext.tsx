
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/supabase';
import { isNullOrUndefined } from '@/utils/supabaseHelpers';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: ProfileType | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data with error handling
  const fetchUserProfile = async (userId: string) => {
    try {
      if (!userId) {
        console.error('No user ID provided to fetchUserProfile');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle null case

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        setProfile(data as ProfileType);
        
        // Check if user needs to be redirected to pro registration
        if (data.role === 'user' && localStorage.getItem('redirect_to_pro_registration') === 'true') {
          localStorage.removeItem('redirect_to_pro_registration');
          window.location.href = '/pro-registration';
        }
        
        return data as ProfileType;
      }
      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Keep track if the component is mounted
    let isMounted = true;

    const setupAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!isMounted) return;
            
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              // Use setTimeout to avoid potential recursive auth issues
              setTimeout(() => {
                if (isMounted) {
                  fetchUserProfile(currentSession.user.id);
                }
              }, 0);
            } else {
              setProfile(null);
            }

            if (event === 'SIGNED_OUT') {
              setProfile(null);
            }

            setLoading(false);
          }
        );

        // THEN check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            await fetchUserProfile(currentSession.user.id);
          }
          
          setLoading(false);
        }

        return () => {
          isMounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setupAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
