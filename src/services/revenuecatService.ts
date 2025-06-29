// Enhanced RevenueCat Integration with Supabase sync
import { supabase, updateSubscriptionTier } from './supabaseService';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  monthlyPrice: number;
  features: string[];
  aiMinutes: number | 'unlimited';
  exclusiveFeatures: string[];
  videoAccess: boolean;
  voiceAccess: boolean;
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    monthlyPrice: 0,
    features: [
      '5 minutes daily with AI hosts',
      'Voice-only shopping sessions',
      'Basic product catalog',
      'Standard checkout'
    ],
    aiMinutes: 5,
    exclusiveFeatures: [],
    videoAccess: false,
    voiceAccess: true
  },
  {
    id: 'plus',
    name: 'TalkShop Plus',
    price: '$9.99/mo',
    monthlyPrice: 9.99,
    features: [
      'Unlimited voice shopping sessions',
      '30 minutes daily video sessions',
      'All premium hosts',
      'Exclusive member deals',
      'Price negotiation with AI',
      'Style analysis & recommendations',
      'Priority customer support'
    ],
    aiMinutes: 'unlimited',
    exclusiveFeatures: ['price_negotiation', 'exclusive_deals', 'style_analysis', 'video_sessions'],
    videoAccess: true,
    voiceAccess: true
  },
  {
    id: 'vip',
    name: 'TalkShop VIP',
    price: '$29.99/mo',
    monthlyPrice: 29.99,
    features: [
      'Everything in Plus',
      'Unlimited video shopping sessions',
      'Private 1-on-1 AI sessions',
      'Custom AI host training',
      'Early access to new features',
      'Personal shopping concierge',
      'White-glove delivery service',
      'VIP-only product launches'
    ],
    aiMinutes: 'unlimited',
    exclusiveFeatures: [
      'unlimited_video',
      'private_sessions', 
      'custom_ai_training', 
      'early_access', 
      'concierge_service',
      'vip_launches'
    ],
    videoAccess: true,
    voiceAccess: true
  }
];

export const initializeRevenueCat = async (userId: string) => {
  console.log('🔄 Initializing RevenueCat for user:', userId);
  
  try {
    // Get user's current subscription from Supabase
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
    
    const currentTier = profile?.subscription_tier || 'free';
    
    return {
      offerings: subscriptionTiers,
      currentTier,
      trialEligible: currentTier === 'free'
    };
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    return {
      offerings: subscriptionTiers,
      currentTier: 'free',
      trialEligible: true
    };
  }
};

export const upgradeSubscription = async (tierId: string, userId: string) => {
  console.log('💳 Processing subscription upgrade:', { tierId, userId });
  
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const tier = subscriptionTiers.find(t => t.id === tierId);
    if (!tier) throw new Error('Invalid tier');
    
    const transactionId = `txn_${Date.now()}`;
    
    // Update subscription in Supabase
    const result = await updateSubscriptionTier(userId, tierId as any, transactionId);
    
    if (!result) throw new Error('Failed to update subscription');
    
    // Track subscription event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'upgrade',
        tier_id: tierId,
        transaction_id: transactionId,
        amount: tier.monthlyPrice,
        created_at: new Date().toISOString()
      });
    
    return {
      success: true,
      tier,
      transactionId,
      message: `Successfully upgraded to ${tier.name}!`
    };
  } catch (error) {
    console.error('Subscription upgrade failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const checkFeatureAccess = (userTier: string, feature: string): boolean => {
  const tier = subscriptionTiers.find(t => t.id === userTier);
  return tier?.exclusiveFeatures.includes(feature) || false;
};

export const checkVideoAccess = (userTier: string): boolean => {
  const tier = subscriptionTiers.find(t => t.id === userTier);
  return tier?.videoAccess || false;
};

export const checkVoiceAccess = (userTier: string): boolean => {
  const tier = subscriptionTiers.find(t => t.id === userTier);
  return tier?.voiceAccess || false;
};

export const getUsageLimits = (userTier: string) => {
  const tier = subscriptionTiers.find(t => t.id === userTier);
  if (!tier) return { voice: 0, video: 0 };
  
  return {
    voice: tier.aiMinutes,
    video: tier.id === 'free' ? 0 : tier.id === 'plus' ? 30 : 'unlimited'
  };
};

// Mock RevenueCat webhook handler
export const handleRevenueCatWebhook = async (webhookData: any) => {
  console.log('📨 RevenueCat webhook received:', webhookData);
  
  const { user_id, product_id, event_type } = webhookData;
  
  switch (event_type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
      // Update user's subscription tier
      const tierMap: Record<string, string> = {
        'talkshop_plus_monthly': 'plus',
        'talkshop_vip_monthly': 'vip'
      };
      
      const newTier = tierMap[product_id];
      if (newTier) {
        await updateSubscriptionTier(user_id, newTier as any, webhookData.transaction_id);
      }
      break;
      
    case 'CANCELLATION':
    case 'EXPIRATION':
      // Downgrade to free tier
      await updateSubscriptionTier(user_id, 'free');
      break;
  }
  
  return { success: true };
};

export default {
  subscriptionTiers,
  initializeRevenueCat,
  upgradeSubscription,
  checkFeatureAccess,
  checkVideoAccess,
  checkVoiceAccess,
  getUsageLimits
};