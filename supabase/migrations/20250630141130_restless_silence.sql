/*
  # Add Gender to User Profiles

  1. Changes
    - Add gender column to user_profiles table
    - Add gender to preferences JSON structure
    - Update existing profiles with default null gender

  2. Security
    - Maintain existing RLS policies
*/

-- Add gender column to user_profiles
ALTER TABLE IF EXISTS user_profiles
ADD COLUMN gender text;

-- Add gender preference to preferences JSON structure
DO $$
BEGIN
  -- Update existing profiles to include gender in preferences
  UPDATE user_profiles
  SET preferences = preferences || 
    jsonb_build_object(
      'gender_preference', NULL
    );
END $$;

-- Add comment to explain the gender field
COMMENT ON COLUMN user_profiles.gender IS 'User''s gender for personalized fashion recommendations';