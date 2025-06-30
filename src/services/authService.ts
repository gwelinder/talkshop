// Google Authentication Service with Supabase integration
import { supabase } from './supabaseService';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isNewUser: boolean;
}

// Google Sign-In with Supabase
export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  try {
    console.log('🔐 Initiating Google sign-in...');
    
    // Get the current domain for redirect - use production URL if deployed
    const currentDomain = window.location.origin;
    const redirectUrl = `${currentDomain}?auth=callback`;
    
    console.log('🔗 Using redirect URL:', redirectUrl);
    
    // Sign in with Supabase Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }

    return null; // Will be handled by the redirect
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    throw error;
  }
};

// Handle auth callback and create user profile
export const handleAuthCallback = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Auth callback error:', error);
      return null;
    }

    console.log('✅ User authenticated:', user.email);

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const isNewUser = !existingProfile;

    // Create profile if new user
    if (isNewUser) {
      console.log('🆕 Creating new user profile...');
      await supabase.from('user_profiles').insert({
        id: user.id,
        email: user.email!,
        subscription_tier: 'free',
        ai_minutes_used_today: 0,
        preferences: {
          preferred_hosts: [],
          style_preferences: [],
          budget_range: 'any',
          favorite_categories: []
        }
      });
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      isNewUser
    };
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return null;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      isNewUser: false
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Listen for auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth state changed:', event);
    
    if (session?.user) {
      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        isNewUser: false
      };
      callback(authUser);
    } else {
      callback(null);
    }
  });
};