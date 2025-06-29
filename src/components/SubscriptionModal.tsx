import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, Star, Check, Sparkles } from 'lucide-react';
import { subscriptionTiers, upgradeSubscription } from '../services/revenuecatService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  onUpgrade: (tier: string) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onUpgrade
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (tierId: string) => {
    setIsProcessing(true);
    try {
      await upgradeSubscription(tierId, 'user_123');
      onUpgrade(tierId);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free': return <Zap className="w-6 h-6" />;
      case 'plus': return <Star className="w-6 h-6" />;
      case 'vip': return <Crown className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const getTierGradient = (tierId: string) => {
    switch (tierId) {
      case 'free': return 'from-gray-500 to-gray-600';
      case 'plus': return 'from-blue-500 to-purple-600';
      case 'vip': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Unlock Premium AI Shopping</h1>
              <p className="text-white/90">Choose your perfect shopping experience</p>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionTiers.map((tier, index) => {
                const isCurrentTier = tier.id === currentTier;
                const isPopular = tier.id === 'plus';
                
                return (
                  <motion.div
                    key={tier.id}
                    className={`relative bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border-2 transition-all duration-300 ${
                      selectedTier === tier.id
                        ? 'border-purple-500 shadow-purple-500/20 shadow-2xl scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {isCurrentTier && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Current Plan
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${getTierGradient(tier.id)} rounded-full flex items-center justify-center text-white`}>
                        {getTierIcon(tier.id)}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {tier.name}
                      </h3>
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {tier.price}
                      </div>
                      {tier.id !== 'free' && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">per month</p>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {!isCurrentTier && (
                      <button
                        onClick={() => handleUpgrade(tier.id)}
                        disabled={isProcessing || tier.id === 'free'}
                        className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                          tier.id === 'free'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : `bg-gradient-to-r ${getTierGradient(tier.id)} text-white hover:scale-105 shadow-lg`
                        }`}
                      >
                        {isProcessing ? 'Processing...' : tier.id === 'free' ? 'Current Plan' : `Upgrade to ${tier.name}`}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Benefits Section */}
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Why Upgrade to Premium?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Unlimited AI Sessions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Shop with AI hosts as long as you want, no daily limits
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Exclusive Features
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Price negotiation, style analysis, and member-only deals
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    VIP Treatment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Personal concierge, custom AI training, and early access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;