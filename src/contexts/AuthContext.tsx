
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: any | null;
  profile: ProfileType | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
      
      return profileData;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions and get user
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          const profileData = await fetchUserProfile(session.user.id);
          if (profileData) {
            // Convert to ProfileType format if needed
            const formattedProfile: ProfileType = {
              ...profileData,
              id: profileData.id || profileData.user_id
            };
            setProfile(formattedProfile);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        toast({
          title: "Erreur d'authentification",
          description: "Impossible de récupérer votre session.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        const profileData = await fetchUserProfile(session.user.id);
        if (profileData) {
          // Convert to ProfileType format if needed
          const formattedProfile: ProfileType = {
            ...profileData,
            id: profileData.id || profileData.user_id
          };
          setProfile(formattedProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Échec de connexion",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) {
        toast({
          title: "Échec d'inscription",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
