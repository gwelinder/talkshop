// Enhanced Supabase Service for data persistence and analytics
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User session tracking
export const trackUserSession = async (userId: string, sessionData: any) => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_data: sessionData,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error tracking user session:', error);
    return null;
  }
};

// Shopping behavior analytics
export const trackShoppingEvent = async (
  userId: string,
  eventType: 'product_view' | 'add_to_cart' | 'purchase' | 'ai_interaction',
  eventData: any
) => {
  try {
    const { data, error } = await supabase
      .from('shopping_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString()
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error tracking shopping event:', error);
    return null;
  }
};

// AI conversation history
export const saveConversationHistory = async (
  userId: string,
  conversationId: string,
  messages: any[]
) => {
  try {
    const { data, error } = await supabase
      .from('conversation_history')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        messages: messages,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return null;
  }
};

// User preferences and AI training data
export const updateUserPreferences = async (userId: string, preferences: any) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences: preferences,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    return null;
  }
};

// Viral content tracking
export const trackViralMetrics = async (
  contentId: string,
  metricType: 'share' | 'view' | 'like' | 'comment',
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('viral_metrics')
      .insert({
        content_id: contentId,
        metric_type: metricType,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error tracking viral metrics:', error);
    return null;
  }
};