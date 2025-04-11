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
  signUp: (email: string, password: string, metadata?: AccountMetadata) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<ProfileType>) => Promise<void>;
}

interface AccountMetadata {
  accountType: 'standard' | 'professional';
  fullName?: string;
  username?: string;
  [key: string]: any;
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
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        setProfile(data as ProfileType);
        
        if (data.role === 'user' && localStorage.getItem('redirect_to_pro_registration') === 'true') {
          localStorage.removeItem('redirect_to_pro_registration');
          window.location.href = '/pro-registration';
        }
        else if (data.role === 'pro' && localStorage.getItem('pro_registration_complete') === 'true') {
          localStorage.removeItem('pro_registration_complete');
          window.location.href = '/pro-dashboard';
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
    let isMounted = true;

    const setupAuth = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!isMounted) return;
            
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
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

  const signUp = async (email: string, password: string, metadata?: AccountMetadata) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    
    if (error) throw error;
    
    if (metadata && metadata.accountType === 'professional' && data.user) {
      try {
        const { error: proProfileError } = await supabase.from('pro_profiles').insert({
          id: data.user.id,
          company_name: metadata.fullName || 'Company Name',
          business_email: email,
        });
        
        if (proProfileError) {
          console.error('Error creating pro_profile:', proProfileError);
        }
      } catch (err) {
        console.error('Error in pro_profile creation process:', err);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (profileData: Partial<ProfileType>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => {
        if (!prev) return profileData as ProfileType;
        return { ...prev, ...profileData };
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
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
        updateProfile,
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
