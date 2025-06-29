import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Crown, Clock, TrendingUp, Heart } from 'lucide-react';
import { getUserProfile, updateUserProfile, UserProfile } from '../services/supabaseService';
import { subscriptionTiers } from '../services/revenuecatService';

interface UserProfileManagerProps {
  userId: string;
  onProfileUpdate: (profile: UserProfile) => void;
}

const UserProfileManager: React.FC<UserProfileManagerProps> = ({
  userId,
  onProfileUpdate
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    preferences: {
      preferred_hosts: [] as string[],
      style_preferences: [] as string[],
      budget_range: 'any',
      favorite_categories: [] as string[]
    }
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          username: userProfile.username || '',
          preferences: userProfile.preferences
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      const updates = {
        username: formData.username,
        preferences: formData.preferences
      };
      
      const updatedProfile = await updateUserProfile(userId, updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
        onProfileUpdate(updatedProfile);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getCurrentTier = () => {
    return subscriptionTiers.find(t => t.id === profile?.subscription_tier) || subscriptionTiers[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
      </div>
    );
  }

  const currentTier = getCurrentTier();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profile.username || 'Shopping Profile'}
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  currentTier.id === 'vip' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                  currentTier.id === 'plus' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                  {currentTier.id === 'vip' && <Crown className="w-4 h-4" />}
                  <span>{currentTier.name}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>{editing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.ai_minutes_used_today}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Minutes used today
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.preferences.favorite_categories.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Favorite categories
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.preferences.preferred_hosts.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Preferred hosts
            </div>
          </div>
        </div>

        {/* Profile Form */}
        {editing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Range
              </label>
              <select
                value={formData.preferences.budget_range}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, budget_range: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="any">Any budget</option>
                <option value="under_50">Under $50</option>
                <option value="50_100">$50 - $100</option>
                <option value="100_250">$100 - $250</option>
                <option value="250_500">$250 - $500</option>
                <option value="over_500">Over $500</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Shopping Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Range:</span>
                  <p className="text-gray-900 dark:text-gray-100 capitalize">
                    {profile.preferences.budget_range.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Benefits */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Current Plan Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentTier.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileManager;