
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  Session,
  User,
} from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/supabase';

interface AuthContextProps {
  user: User | null;
  profile: ProfileType | null;
  loading: boolean;
  session: Session | null; // Add missing session property
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  update: (data: Partial<ProfileType>) => Promise<void>;
  error: string | null;
  isAdmin?: boolean; // Add isAdmin property for AdminRecipes
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  profile: null,
  loading: true,
  session: null, // Initialize session as null
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  update: async () => {},
  error: null,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Add session state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add isAdmin state

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    };

    const fetchProfile = async (userId: string) => {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileData) {
          // Conversion explicite du profil pour s'assurer qu'il correspond au type ProfileType
          const typedProfile: ProfileType = {
            ...profileData,
            // Ensure all required properties exist, even if they don't in the database yet
            address_line1: profileData.address_line1 || profileData.address || '',
            address_line2: profileData.address_line2 || null,
            postal_code: profileData.postal_code || '',
            city: profileData.city || '',
          };
          
          setProfile(typedProfile);
          setIsAdmin(typedProfile.role === 'admin');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: '',
          },
        },
      });
      if (error) {
        throw error;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: username,
            },
          ]);

        if (profileError) {
          throw profileError;
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const update = async (data: Partial<ProfileType>) => {
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('No user is signed in');

      const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Optimistically update the profile in the context
      setProfile((prevProfile) => {
        return prevProfile ? { ...prevProfile, ...data } : null;
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        update,
        error,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
