import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Video, Star, Zap, Settings, User, Search } from 'lucide-react';
import Header from './components/Header';
import AIShoppingAssistant from './components/AIShoppingAssistant';
import EnvironmentSetup from './components/EnvironmentSetup';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import SessionTypeSelector from './components/SessionTypeSelector';
import SubscriptionModal from './components/SubscriptionModal';
import { useProducts } from './hooks/useProducts';
import { getProductById } from './services/productService';
import { getApiConfig } from './services/tavusService';
import { getCurrentUser, onAuthStateChange, AuthUser } from './services/authService';
import { getUserProfile, UserProfile } from './services/supabaseService';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showEnvSetup, setShowEnvSetup] = useState(false);
  const [spotlightProduct, setSpotlightProduct] = useState(null);
  const [comparisonProducts, setComparisonProducts] = useState([]);
  const [activeOffer, setActiveOffer] = useState(null);
  const [show360, setShow360] = useState(false);
  const [cartJiggle, setCartJiggle] = useState(false);
  
  // Auth and user state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Session and subscription state
  const [sessionType, setSessionType] = useState<'voice' | 'video' | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Use the optimized products hook
  const { products, categories, loading, error, getFeatured, prefetchProduct } = useProducts();

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setAuthUser(user);
        
        if (user) {
          // Load user profile
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setAuthUser(user);
      setAuthLoading(false);
      
      if (user) {
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
        setCurrentView('home'); // Reset to home when signed out
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Check API configuration on load - ONLY show setup in dev mode
  useEffect(() => {
    const config = getApiConfig();
    console.log('🔍 Environment check:', {
      isProduction: config.isProduction,
      isDevelopment: config.isDevelopment,
      shouldShowSetup: config.shouldShowSetup,
      hostname: window.location.hostname
    });
    
    // Only show environment setup in development mode
    if (config.shouldShowSetup) {
      setShowEnvSetup(true);
    }
  }, []);

  // Optimized addToCart function
  const addToCart = useCallback(async (productId, quantity = 1) => {
    // Try to find product in current products first
    let product = products.find(p => p.id === productId);
    
    // If not found, fetch from API
    if (!product) {
      product = await getProductById(productId);
    }
    
    if (product) {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === productId);
        if (existing) {
          return prev.map(item => 
            item.id === productId 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
    }
  }, [products]);

  // Cart jiggle handler
  const handleCartJiggle = useCallback(() => {
    setCartJiggle(true);
    setTimeout(() => setCartJiggle(false), 600);
  }, []);

  // Enhanced tool call handler with proactive cart support
  const handleToolCall = useCallback(async (toolCall) => {
    console.log('🔧 App handling tool call:', toolCall);
    
    switch (toolCall.function.name) {
      case 'show_product':
        let foundProduct = products.find(p => p.id === toolCall.function.arguments.product_id);
        
        if (!foundProduct) {
          foundProduct = await getProductById(toolCall.function.arguments.product_id);
        }
        
        if (foundProduct) {
          setSpotlightProduct({
            ...foundProduct,
            highlightFeatures: toolCall.function.arguments.highlight_features
          });
          setComparisonProducts([]);
          setShow360(false);
        }
        break;
        
      case 'compare_products':
        const compareItems = await Promise.all(
          toolCall.function.arguments.product_ids.map(async (id) => {
            let product = products.find(p => p.id === id);
            if (!product) {
              product = await getProductById(id);
            }
            return product;
          })
        );
        setComparisonProducts(compareItems.filter(Boolean));
        setSpotlightProduct(null);
        break;
        
      case 'highlight_offer':
        setActiveOffer({
          productId: toolCall.function.arguments.product_id,
          type: toolCall.function.arguments.offer_type,
          discount: toolCall.function.arguments.discount_percentage
        });
        setTimeout(() => setActiveOffer(null), 10000);
        break;
        
      case 'add_to_cart':
      case 'proactively_add_to_cart':
        // Handle both explicit and proactive cart additions
        const productId = toolCall.function.arguments.product_id;
        const quantity = toolCall.function.arguments.quantity || 1;
        addToCart(productId, quantity);
        break;
        
      case 'show_360_view':
        setShow360(toolCall.function.arguments.product_id);
        break;
        
      case 'initiate_checkout':
        console.log('🛒 Initiating checkout with items:', toolCall.function.arguments.cart_items);
        setCurrentView('checkout');
        break;
        
      case 'show_product_grid':
        // Handle product grid display - this is now handled in AIShoppingAssistant
        console.log('📋 Product grid requested:', toolCall.function.arguments);
        break;
        
      case 'show_categories':
        // Handle category display - this is now handled in AIShoppingAssistant
        console.log('📂 Categories requested');
        break;
    }
  }, [products, addToCart]);

  // Handle session type selection
  const handleSessionSelect = (type: 'voice' | 'video') => {
    setSessionType(type);
    setCurrentView('shopping');
  };

  // Handle upgrade required
  const handleUpgradeRequired = () => {
    setShowSubscriptionModal(true);
  };

  // Handle subscription upgrade
  const handleSubscriptionUpgrade = (tier: string) => {
    // Update user profile with new tier
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        subscription_tier: tier as any
      });
    }
    setShowSubscriptionModal(false);
  };

  // Show environment setup only in dev mode
  if (showEnvSetup) {
    return (
      <EnvironmentSetup 
        onSetup={() => setShowEnvSetup(false)}
      />
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading TalkShop...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header 
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onShowCart={() => setCurrentView('cart')}
        onShowSettings={() => setShowEnvSetup(true)}
        cartJiggle={cartJiggle}
        user={authUser}
      />

      {currentView === 'home' && (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {!authUser || !sessionType ? (
            <SessionTypeSelector
              userTier={userProfile?.subscription_tier || 'free'}
              userId={authUser?.id || ''}
              onSelectSession={handleSessionSelect}
              onUpgradeRequired={handleUpgradeRequired}
            />
          ) : (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <AIShoppingAssistant 
                allProducts={products}
                onToolCall={handleToolCall}
                addToCart={addToCart}
                spotlightProduct={spotlightProduct}
                comparisonProducts={comparisonProducts}
                activeOffer={activeOffer}
                show360={show360}
                onShow360Change={setShow360}
                cartItems={cartItems}
                onCartJiggle={handleCartJiggle}
                sessionType={sessionType}
                userTier={userProfile?.subscription_tier || 'free'}
                userId={authUser.id}
              />
            </div>
          )}
        </main>
      )}

      {currentView === 'shopping' && authUser && sessionType && (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <AIShoppingAssistant 
            allProducts={products}
            onToolCall={handleToolCall}
            addToCart={addToCart}
            spotlightProduct={spotlightProduct}
            comparisonProducts={comparisonProducts}
            activeOffer={activeOffer}
            show360={show360}
            onShow360Change={setShow360}
            cartItems={cartItems}
            onCartJiggle={handleCartJiggle}
            sessionType={sessionType}
            userTier={userProfile?.subscription_tier || 'free'}
            userId={authUser.id}
          />
        </main>
      )}

      {currentView === 'cart' && (
        <Cart 
          items={cartItems}
          onUpdateQuantity={(id, quantity) => {
            if (quantity === 0) {
              setCartItems(prev => prev.filter(item => item.id !== id));
            } else {
              setCartItems(prev => prev.map(item => 
                item.id === id ? { ...item, quantity } : item
              ));
            }
          }}
          onClose={() => setCurrentView(sessionType ? 'shopping' : 'home')}
          onCheckout={() => setCurrentView('checkout')}
        />
      )}

      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cartItems}
          onClose={() => setCurrentView(sessionType ? 'shopping' : 'home')}
        />
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentTier={userProfile?.subscription_tier || 'free'}
        onUpgrade={handleSubscriptionUpgrade}
      />
    </div>
  );
}

export default App;