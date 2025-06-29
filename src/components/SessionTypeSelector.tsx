import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, Crown, Clock, Zap, Star } from 'lucide-react';
import { checkVideoAccess, checkVoiceAccess, getUsageLimits } from '../services/revenuecatService';
import { checkAIUsageLimit } from '../services/supabaseService';

interface SessionTypeSelectorProps {
  userTier: string;
  userId: string;
  onSelectSession: (type: 'voice' | 'video') => void;
  onUpgradeRequired: () => void;
}

const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({
  userTier,
  userId,
  onSelectSession,
  onUpgradeRequired
}) => {
  const [usageData, setUsageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsageData = async () => {
      const usage = await checkAIUsageLimit(userId);
      setUsageData(usage);
      setLoading(false);
    };
    
    fetchUsageData();
  }, [userId]);

  const hasVideoAccess = checkVideoAccess(userTier);
  const hasVoiceAccess = checkVoiceAccess(userTier);
  const limits = getUsageLimits(userTier);

  const handleSessionSelect = (type: 'voice' | 'video') => {
    if (type === 'video' && !hasVideoAccess) {
      onUpgradeRequired();
      return;
    }
    
    if (!usageData?.canUse && userTier === 'free') {
      onUpgradeRequired();
      return;
    }
    
    onSelectSession(type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Choose Your Shopping Experience
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Select how you'd like to shop with our AI hosts
        </p>
        
        {/* Usage Display */}
        {userTier === 'free' && usageData && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center justify-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {usageData.minutesRemaining} minutes remaining today
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Voice Shopping */}
        <motion.div
          className={`relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer ${
            hasVoiceAccess && usageData?.canUse
              ? 'border-blue-300 hover:border-blue-500 hover:shadow-blue-500/20 hover:shadow-2xl'
              : 'border-gray-300 dark:border-gray-600 opacity-60'
          }`}
          whileHover={hasVoiceAccess && usageData?.canUse ? { scale: 1.02 } : {}}
          onClick={() => handleSessionSelect('voice')}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Mic className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Voice Shopping
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Chat with AI hosts through voice conversation. Perfect for hands-free shopping while multitasking.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Available on all plans</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {userTier === 'free' ? '5 minutes daily' : 'Unlimited'}
                </span>
              </div>
            </div>
            
            {(!hasVoiceAccess || !usageData?.canUse) && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-700">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {!usageData?.canUse ? 'Daily limit reached' : 'Upgrade required'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Video Shopping */}
        <motion.div
          className={`relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer ${
            hasVideoAccess
              ? 'border-purple-300 hover:border-purple-500 hover:shadow-purple-500/20 hover:shadow-2xl'
              : 'border-gray-300 dark:border-gray-600 opacity-60'
          }`}
          whileHover={hasVideoAccess ? { scale: 1.02 } : {}}
          onClick={() => handleSessionSelect('video')}
        >
          {!hasVideoAccess && (
            <div className="absolute top-4 right-4">
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>
          )}
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Video className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Video Shopping
              {!hasVideoAccess && (
                <span className="ml-2 text-yellow-500 text-lg">👑</span>
              )}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Full video experience with AI hosts who can see you and provide personalized style analysis and product demonstrations.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2 text-purple-600 dark:text-purple-400">
                <Star className="w-4 h-4" />
                <span className="text-sm">Premium feature</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-purple-600 dark:text-purple-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {userTier === 'free' ? '5 min trial' : 
                   userTier === 'plus' ? '30 min daily' : 'Unlimited'}
                </span>
              </div>
            </div>
            
            {!hasVideoAccess ? (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <p className="text-purple-700 dark:text-purple-300 text-sm font-medium mb-2">
                  Premium Feature
                </p>
                <p className="text-purple-600 dark:text-purple-400 text-xs">
                  Upgrade to Plus or VIP for full video shopping experience
                </p>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                <p className="text-green-700 dark:text-green-300 text-sm">
                  ✓ Video access included
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Free Tier Video Trial */}
      {userTier === 'free' && (
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
            <h4 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">
              🎁 Free Video Trial Available!
            </h4>
            <p className="text-purple-700 dark:text-purple-300 text-sm mb-4">
              Try our premium video shopping experience for 5 minutes - no commitment required!
            </p>
            <button
              onClick={() => handleSessionSelect('video')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              Start Free Video Trial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTypeSelector;