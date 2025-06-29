// RevenueCat Integration for Make More Money Challenge ($25k)
export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  aiMinutes: number | 'unlimited';
  exclusiveFeatures: string[];
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: [
      '5 minutes daily with AI hosts',
      'Basic product catalog',
      'Standard checkout'
    ],
    aiMinutes: 5,
    exclusiveFeatures: []
  },
  {
    id: 'plus',
    name: 'TalkShop Plus',
    price: '$9.99/mo',
    features: [
      'Unlimited AI shopping sessions',
      'All premium hosts',
      'Exclusive member deals',
      'Price negotiation with AI',
      'Style analysis & recommendations',
      'Priority customer support'
    ],
    aiMinutes: 'unlimited',
    exclusiveFeatures: ['price_negotiation', 'exclusive_deals', 'style_analysis']
  },
  {
    id: 'vip',
    name: 'TalkShop VIP',
    price: '$29.99/mo',
    features: [
      'Everything in Plus',
      'Private 1-on-1 AI sessions',
      'Custom AI host training',
      'Early access to new features',
      'Personal shopping concierge',
      'White-glove delivery service',
      'VIP-only product launches'
    ],
    aiMinutes: 'unlimited',
    exclusiveFeatures: [
      'private_sessions', 
      'custom_ai_training', 
      'early_access', 
      'concierge_service',
      'vip_launches'
    ]
  }
];

export const initializeRevenueCat = async (userId: string) => {
  // Mock RevenueCat integration - in production would use actual SDK
  console.log('🔄 Initializing RevenueCat for user:', userId);
  
  // Simulate API call to RevenueCat
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        offerings: subscriptionTiers,
        currentTier: 'free',
        trialEligible: true
      });
    }, 1000);
  });
};

export const upgradeSubscription = async (tierId: string, userId: string) => {
  console.log('💳 Upgrading subscription:', { tierId, userId });
  
  // Simulate payment processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        tier: subscriptionTiers.find(t => t.id === tierId),
        transactionId: `txn_${Date.now()}`
      });
    }, 2000);
  });
};

export const checkFeatureAccess = (userTier: string, feature: string): boolean => {
  const tier = subscriptionTiers.find(t => t.id === userTier);
  return tier?.exclusiveFeatures.includes(feature) || false;
};