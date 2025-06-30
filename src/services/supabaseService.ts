// Supabase Service with user profile management
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  subscription_tier: 'free' | 'plus' | 'vip';
  ai_minutes_used_today: number;
  gender?: string; // Added gender field
  preferences: {
    preferred_hosts: string[];
    style_preferences: string[];
    budget_range: string;
    favorite_categories: string[];
    gender_preference?: string; // Added gender preference
  };
  created_at: string;
  updated_at: string;
}

// User Profile Management
export const createUserProfile = async (userId: string, email: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        subscription_tier: 'free',
        ai_minutes_used_today: 0,
        gender: null, // Default to null
        preferences: {
          preferred_hosts: [],
          style_preferences: [],
          budget_range: 'any',
          favorite_categories: [],
          gender_preference: null // Default to null
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Update user gender
export const updateUserGender = async (userId: string, gender: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        gender,
        preferences: supabase.rpc('jsonb_set', {
          target: 'preferences',
          path: '{gender_preference}',
          value: gender
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user gender:', error);
    return null;
  }
};

// Subscription Management
export const updateSubscriptionTier = async (
  userId: string,
  newTier: 'free' | 'plus' | 'vip',
  transactionId?: string
) => {
  try {
    const updates: Partial<UserProfile> = {
      subscription_tier: newTier
    };
    
    // Reset daily usage when upgrading
    if (newTier !== 'free') {
      updates.ai_minutes_used_today = 0;
    }
    
    const result = await updateUserProfile(userId, updates);
    
    // Log subscription change
    if (result && transactionId) {
      await supabase
        .from('subscription_events')
        .insert({
          user_id: userId,
          event_type: 'upgrade',
          tier_id: newTier,
          transaction_id: transactionId
        });
    }
    
    return result;
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    return null;
  }
};

// Usage Tracking
export const trackAIUsage = async (userId: string, minutesUsed: number) => {
  try {
    // Get current usage
    const profile = await getUserProfile(userId);
    if (!profile) return false;
    
    const newUsage = profile.ai_minutes_used_today + minutesUsed;
    
    // Update usage
    await updateUserProfile(userId, {
      ai_minutes_used_today: newUsage
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    return false;
  }
};

export const checkAIUsageLimit = async (userId: string): Promise<{
  canUse: boolean;
  minutesUsed: number;
  minutesRemaining: number;
  tier: string;
}> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      return { canUse: false, minutesUsed: 0, minutesRemaining: 0, tier: 'free' };
    }
    
    const limits = {
      free: 5,
      plus: Infinity,
      vip: Infinity
    };
    
    const limit = limits[profile.subscription_tier];
    const used = profile.ai_minutes_used_today;
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
    
    return {
      canUse: remaining > 0,
      minutesUsed: used,
      minutesRemaining: remaining,
      tier: profile.subscription_tier
    };
  } catch (error) {
    console.error('Error checking AI usage limit:', error);
    return { canUse: false, minutesUsed: 0, minutesRemaining: 0, tier: 'free' };
  }
};

export default supabase;