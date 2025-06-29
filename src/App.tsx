import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Video, Star, Zap, Settings, User, Search } from 'lucide-react';
import Header from './components/Header';
import AIShoppingAssistant from './components/AIShoppingAssistant';
import EnvironmentSetup from './components/EnvironmentSetup';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FOMORibbon from './components/FOMORibbon';
import { useProducts } from './hooks/useProducts';
import { getProductById } from './services/productService';
import { getApiConfig } from './services/tavusService';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showEnvSetup, setShowEnvSetup] = useState(false);
  const [spotlightProduct, setSpotlightProduct] = useState(null);
  const [comparisonProducts, setComparisonProducts] = useState([]);
  const [activeOffer, setActiveOffer] = useState(null);
  const [show360, setShow360] = useState(false);

  // Use the optimized products hook
  const { products, categories, loading, error, getFeatured, prefetchProduct } = useProducts();

  // Check API configuration on load
  useEffect(() => {
    const config = getApiConfig();
    setShowEnvSetup(true);
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

  // Optimized tool call handler
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
        addToCart(toolCall.function.arguments.product_id, toolCall.function.arguments.quantity || 1);
        break;
        
      case 'show_360_view':
        setShow360(toolCall.function.arguments.product_id);
        break;
        
      case 'initiate_checkout':
        console.log('🛒 Initiating checkout with items:', toolCall.function.arguments.cart_items);
        setCurrentView('checkout');
        break;
    }
  }, [products, addToCart]);

  if (showEnvSetup) {
    return (
      <EnvironmentSetup 
        onSetup={() => setShowEnvSetup(false)}
      />
    );
  }

  if (loading) {
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
      />

      {/* FOMO Ribbon */}
      <FOMORibbon />

      {currentView === 'home' && (
        <main>
          {/* Hero Section - Focused and Minimal */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="container mx-auto px-4 py-12">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-6">
                  Shop with <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Meet Aria, your personal shopping curator. Experience live product demonstrations, 
                  expert recommendations, and personalized styling advice.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live AI Curator</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4" />
                    <span>Real-time Demos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>{products.length}+ Products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Shopping Assistant - Now the Main Stage */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl min-h-screen">
            <div className="container mx-auto px-4 py-16">
              <AIShoppingAssistant 
                allProducts={products}
                onToolCall={handleToolCall}
                addToCart={addToCart}
                spotlightProduct={spotlightProduct}
                comparisonProducts={comparisonProducts}
                activeOffer={activeOffer}
                show360={show360}
                onShow360Change={setShow360}
              />
            </div>
          </div>
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
          onClose={() => setCurrentView('home')}
          onCheckout={() => setCurrentView('checkout')}
        />
      )}

      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cartItems}
          onClose={() => setCurrentView('home')}
        />
      )}
    </div>
  );
}

export default App;