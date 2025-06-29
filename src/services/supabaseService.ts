// Enhanced Supabase Service with real-time data and user management
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
  preferences: {
    preferred_hosts: string[];
    style_preferences: string[];
    budget_range: string;
    favorite_categories: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface ShoppingSession {
  id: string;
  user_id: string;
  session_type: 'voice' | 'video';
  host_id: string;
  duration_minutes: number;
  products_viewed: string[];
  products_added_to_cart: string[];
  total_spent: number;
  session_data: any;
  created_at: string;
}

export interface ViralContent {
  id: string;
  user_id: string;
  content_type: 'product_reveal' | 'style_transformation' | 'price_drop';
  product_id: string;
  shares: number;
  views: number;
  likes: number;
  created_at: string;
}

// User Management
export const createUserProfile = async (userId: string, email: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        subscription_tier: 'free',
        ai_minutes_used_today: 0,
        preferences: {
          preferred_hosts: [],
          style_preferences: [],
          budget_range: 'any',
          favorite_categories: []
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

// Session Tracking with Real-time Updates
export const startShoppingSession = async (
  userId: string,
  sessionType: 'voice' | 'video',
  hostId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('shopping_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType,
        host_id: hostId,
        duration_minutes: 0,
        products_viewed: [],
        products_added_to_cart: [],
        total_spent: 0,
        session_data: {}
      })
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error starting shopping session:', error);
    return null;
  }
};

export const updateShoppingSession = async (
  sessionId: string,
  updates: Partial<ShoppingSession>
) => {
  try {
    const { data, error } = await supabase
      .from('shopping_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating shopping session:', error);
    return null;
  }
};

// AI Usage Tracking for Subscription Limits
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

// Viral Content Tracking
export const createViralContent = async (
  userId: string,
  contentType: 'product_reveal' | 'style_transformation' | 'price_drop',
  productId: string
) => {
  try {
    const { data, error } = await supabase
      .from('viral_content')
      .insert({
        user_id: userId,
        content_type: contentType,
        product_id: productId,
        shares: 0,
        views: 0,
        likes: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating viral content:', error);
    return null;
  }
};

export const trackViralMetric = async (
  contentId: string,
  metricType: 'share' | 'view' | 'like'
) => {
  try {
    const { data, error } = await supabase.rpc('increment_viral_metric', {
      content_id: contentId,
      metric_type: metricType
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error tracking viral metric:', error);
    return null;
  }
};

// Real-time Analytics
export const getRealtimeAnalytics = () => {
  return supabase
    .channel('analytics')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'shopping_sessions' },
      (payload) => {
        console.log('Real-time session update:', payload);
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'viral_content' },
      (payload) => {
        console.log('Real-time viral update:', payload);
      }
    )
    .subscribe();
};

// Subscription Management Integration
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
        .from('subscription_changes')
        .insert({
          user_id: userId,
          old_tier: 'free', // Would get from current profile in real app
          new_tier: newTier,
          transaction_id: transactionId,
          created_at: new Date().toISOString()
        });
    }
    
    return result;
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    return null;
  }
};

// Daily Usage Reset (would be called by a cron job)
export const resetDailyUsage = async () => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ ai_minutes_used_today: 0 });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting daily usage:', error);
    return false;
  }
};

export default supabase;