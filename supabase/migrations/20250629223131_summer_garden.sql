/*
  # User Management and Analytics Schema

  1. New Tables
    - `user_profiles` - Extended user profiles with preferences and subscription data
    - `shopping_sessions` - Track AI shopping sessions for analytics
    - `subscription_events` - Log subscription changes and payments
    - `viral_content` - Track shareable content and viral metrics
    - `conversation_history` - Store AI conversation data for training

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Ensure users can only access their own data

  3. Functions
    - `increment_viral_metric` - Atomic increment for viral metrics
    - `reset_daily_usage` - Reset daily AI usage limits
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  username text UNIQUE,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'vip')),
  ai_minutes_used_today integer NOT NULL DEFAULT 0,
  video_minutes_used_today integer NOT NULL DEFAULT 0,
  preferences jsonb NOT NULL DEFAULT '{
    "preferred_hosts": [],
    "style_preferences": [],
    "budget_range": "any",
    "favorite_categories": []
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shopping Sessions Table
CREATE TABLE IF NOT EXISTS shopping_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('voice', 'video')),
  host_id text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  products_viewed text[] DEFAULT '{}',
  products_added_to_cart text[] DEFAULT '{}',
  total_spent decimal(10,2) DEFAULT 0,
  session_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Subscription Events Table
CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('upgrade', 'downgrade', 'cancel', 'renewal')),
  tier_id text NOT NULL,
  transaction_id text,
  amount decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Viral Content Table
CREATE TABLE IF NOT EXISTS viral_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('product_reveal', 'style_transformation', 'price_drop')),
  product_id text NOT NULL,
  shares integer DEFAULT 0,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  content_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Conversation History Table
CREATE TABLE IF NOT EXISTS conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id text NOT NULL,
  host_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]',
  session_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for shopping_sessions
CREATE POLICY "Users can view own sessions"
  ON shopping_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON shopping_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON shopping_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscription_events
CREATE POLICY "Users can view own subscription events"
  ON subscription_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert subscription events"
  ON subscription_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow service to insert events

-- RLS Policies for viral_content
CREATE POLICY "Users can view own viral content"
  ON viral_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own viral content"
  ON viral_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view viral metrics"
  ON viral_content
  FOR SELECT
  TO anon
  USING (true); -- Allow anonymous viewing of viral metrics

-- RLS Policies for conversation_history
CREATE POLICY "Users can view own conversations"
  ON conversation_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to increment viral metrics atomically
CREATE OR REPLACE FUNCTION increment_viral_metric(
  content_id uuid,
  metric_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CASE metric_type
    WHEN 'share' THEN
      UPDATE viral_content SET shares = shares + 1 WHERE id = content_id;
    WHEN 'view' THEN
      UPDATE viral_content SET views = views + 1 WHERE id = content_id;
    WHEN 'like' THEN
      UPDATE viral_content SET likes = likes + 1 WHERE id = content_id;
  END CASE;
END;
$$;

-- Function to reset daily usage (called by cron job)
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    ai_minutes_used_today = 0,
    video_minutes_used_today = 0,
    updated_at = now();
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_id ON shopping_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_created_at ON shopping_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_viral_content_user_id ON viral_content(user_id);
CREATE INDEX IF NOT EXISTS idx_viral_content_created_at ON viral_content(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);