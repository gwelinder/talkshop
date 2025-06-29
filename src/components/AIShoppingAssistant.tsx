import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, ShoppingCart, Eye, Heart, 
  RotateCcw, Maximize, Zap, Sparkles, MessageCircle, Play, Pause, Search, Star, Check 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createEnhancedShoppingSession, updatePersonaWithDynamicTools } from '../services/enhancedTavusService';
import { searchProducts, getProductById } from '../services/productService';
import AriaStatus from './AriaStatus';
import CategoryGridDisplay from './CategoryGridDisplay';
import ProductGrid from './ProductGrid';
import MagicCartAnimation from './MagicCartAnimation';
import HostSelector from './HostSelector';
import { useMagicCart } from '../hooks/useMagicCart';
import DailyIframe from '@daily-co/daily-js';

interface Host {
  id: string;
  name: string;
  replicaId: string;
  description: string;
  specialty: string;
  personality: string;
  image: string;
  customPrompt?: string;
}

interface AIShoppingAssistantProps {
  allProducts: any[];
  onToolCall: (toolCall: any) => void;
  addToCart: (productId: string, quantity: number) => void;
  spotlightProduct: any;
  comparisonProducts: any[];
  activeOffer: any;
  show360: string | false;
  onShow360Change: (productId: string | false) => void;
  cartItems?: any[];
  onCartJiggle?: () => void;
}

interface ShowcaseContent {
  type: 'initial' | 'product' | 'comparison' | 'grid' | 'categories' | 'host-selection';
  data: any;
}

// Singleton call object as recommended by Tavus
const getOrCreateCallObject = () => {
  if (!(window as any)._dailyCallObject) {
    (window as any)._dailyCallObject = DailyIframe.createCallObject();
  }
  return (window as any)._dailyCallObject;
};

const AIShoppingAssistant: React.FC<AIShoppingAssistantProps> = ({
  allProducts,
  onToolCall,
  addToCart,
  spotlightProduct,
  comparisonProducts,
  activeOffer,
  show360,
  onShow360Change,
  cartItems = [],
  onCartJiggle
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [replicaState, setReplicaState] = useState<'connecting' | 'listening' | 'speaking'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [transcript, setTranscript] = useState<string>('');
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [cartSuccessTimer, setCartSuccessTimer] = useState<NodeJS.Timeout | null>(null);
  const [showcaseGlow, setShowcaseGlow] = useState(false);
  const [rotation360, setRotation360] = useState(0);
  const [showDragHint, setShowDragHint] = useState(true);
  const [proactiveCartMessage, setProactiveCartMessage] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  
  // Magic Cart Animation
  const { animationState, triggerMagicCart, completeMagicCart } = useMagicCart();
  
  // New unified showcase state - starts with host selection
  const [showcaseContent, setShowcaseContent] = useState<ShowcaseContent>({ 
    type: 'host-selection', 
    data: null 
  });
  
  // Daily.js state
  const callRef = useRef<any>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<any>({});
  const [callState, setCallState] = useState<string>('idle');
  
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const rotation360Ref = useRef<NodeJS.Timeout | null>(null);

  // Update persona tools on component mount
  useEffect(() => {
    updatePersonaWithDynamicTools().catch(console.error);
  }, []);

  // Simulate live viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Trigger showcase glow effect when content changes
  useEffect(() => {
    if (showcaseContent.type !== 'initial' && showcaseContent.type !== 'host-selection') {
      setShowcaseGlow(true);
      const timer = setTimeout(() => setShowcaseGlow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showcaseContent]);

  // Auto-rotate 360 view
  useEffect(() => {
    if (show360) {
      rotation360Ref.current = setInterval(() => {
        setRotation360(prev => (prev + 5) % 360);
      }, 100);
      
      // Hide drag hint after 3 seconds
      const hintTimer = setTimeout(() => setShowDragHint(false), 3000);
      
      return () => {
        if (rotation360Ref.current) {
          clearInterval(rotation360Ref.current);
        }
        clearTimeout(hintTimer);
      };
    } else {
      setRotation360(0);
      setShowDragHint(true);
    }
  }, [show360]);

  // Easter egg detection
  const checkForEasterEggs = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('greg')) {
      handleToolCall({
        function: {
          name: 'show_product',
          arguments: {
            product_id: 'prod_003',
            product_name: 'Greg-grade Quantum Earbuds',
            highlight_features: ['Greg-approved quality', 'Spatial audio mastery', 'Founder-worthy sound']
          }
        }
      });
    }
  };

  // Enhanced magic cart handler
  const handleMagicAddToCart = (productId: string, quantity: number, sourceElement?: HTMLElement) => {
    // Find the product for the animation
    const product = allProducts.find(p => p.id === productId) || showcaseContent.data;
    
    if (product && sourceElement) {
      // Trigger magic cart animation
      triggerMagicCart(
        product.image || product.thumbnail,
        product.title || product.name,
        sourceElement
      );
      
      // Trigger cart jiggle in header
      if (onCartJiggle) {
        setTimeout(() => onCartJiggle(), 800); // Delay to sync with animation
      }
    }
    
    // Add to cart
    addToCart(productId, quantity);
  };

  // Enhanced tool call handler with ambient intelligence support
  const handleToolCall = async (toolCall: any) => {
    console.log('🔧 AI Assistant received tool call:', toolCall);
    
    // Handle cart animation with persistent success state
    if (toolCall.function.name === 'add_to_cart' || toolCall.function.name === 'proactively_add_to_cart') {
      setCartAnimation(true);
      
      // Handle proactive cart message
      if (toolCall.function.name === 'proactively_add_to_cart' && toolCall.function.arguments.confirmation_speech) {
        setProactiveCartMessage(toolCall.function.arguments.confirmation_speech);
        setTimeout(() => setProactiveCartMessage(null), 5000);
      }
      
      // Clear existing timer
      if (cartSuccessTimer) {
        clearTimeout(cartSuccessTimer);
      }
      
      // Set new timer for 1.2s persistence
      const timer = setTimeout(() => {
        setCartAnimation(false);
        setCartSuccessTimer(null);
      }, 1200);
      
      setCartSuccessTimer(timer);
    }
    
    // Handle new dynamic presentation tools
    switch (toolCall.function.name) {
      case 'show_product':
        let foundProduct = allProducts.find(p => p.id === toolCall.function.arguments.product_id);
        
        if (!foundProduct) {
          foundProduct = await getProductById(toolCall.function.arguments.product_id);
        }
        
        if (foundProduct) {
          setShowcaseContent({
            type: 'product',
            data: {
              ...foundProduct,
              highlightFeatures: toolCall.function.arguments.highlight_features
            }
          });
        }
        break;
        
      case 'show_product_grid':
        const gridProducts = toolCall.function.arguments.products;
        setShowcaseContent({
          type: 'grid',
          data: {
            products: gridProducts,
            title: toolCall.function.arguments.title
          }
        });
        break;
        
      case 'show_categories':
        setShowcaseContent({
          type: 'categories',
          data: null
        });
        break;
        
      case 'compare_products':
        const compareItems = await Promise.all(
          toolCall.function.arguments.product_ids.map(async (id: string) => {
            let product = allProducts.find(p => p.id === id);
            if (!product) {
              product = await getProductById(id);
            }
            return product;
          })
        );
        setShowcaseContent({
          type: 'comparison',
          data: {
            products: compareItems.filter(Boolean),
            aspect: toolCall.function.arguments.comparison_aspect
          }
        });
        break;
        
      case 'search_products':
        try {
          const searchParams = {
            search: toolCall.function.arguments.search_query,
            category: toolCall.function.arguments.category,
            minPrice: toolCall.function.arguments.min_price,
            maxPrice: toolCall.function.arguments.max_price,
            limit: 8
          };
          
          const results = await searchProducts(searchParams);
          setShowcaseContent({
            type: 'grid',
            data: {
              products: results,
              title: `Search Results: ${toolCall.function.arguments.search_query}`
            }
          });
        } catch (error) {
          console.error('Search error:', error);
        }
        return; // Don't forward search tool calls to parent
        
      default:
        // Forward other tool calls to parent component
        onToolCall(toolCall);
        return;
    }
    
    // Forward tool calls to parent for other handling (like cart updates)
    onToolCall(toolCall);
  };

  // Parse tool call from Tavus format
  const parseToolCall = (data: any) => {
    try {
      // Handle both direct tool calls and conversation tool calls
      if (data.type === 'conversation-toolcall' && data.tool_call) {
        return data.tool_call;
      }
      
      // Handle tool calls from app messages
      if (data.event_type === 'conversation.tool_call' && data.properties) {
        const { name, arguments: args } = data.properties;
        
        // Parse arguments if they're a string
        let parsedArgs = args;
        if (typeof args === 'string') {
          try {
            parsedArgs = JSON.parse(args);
          } catch (e) {
            console.error('Failed to parse tool call arguments:', e);
            return null;
          }
        }
        
        return {
          function: {
            name: name,
            arguments: parsedArgs
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing tool call:', error);
      return null;
    }
  };

  // Update remote participants
  const updateRemoteParticipants = () => {
    if (!callRef.current) return;
    
    const participants = callRef.current.participants();
    const remotes: any = {};
    
    Object.entries(participants).forEach(([id, p]: [string, any]) => {
      if (id !== 'local') {
        remotes[id] = p;
      }
    });
    
    console.log('👥 Remote participants updated:', Object.keys(remotes));
    setRemoteParticipants(remotes);
  };

  // Attach video and audio tracks
  useEffect(() => {
    Object.entries(remoteParticipants).forEach(([id, p]: [string, any]) => {
      // Video
      const videoEl = document.getElementById(`ai-video-${id}`) as HTMLVideoElement;
      if (videoEl && p.tracks?.video && p.tracks.video.state === 'playable' && p.tracks.video.persistentTrack) {
        videoEl.srcObject = new MediaStream([p.tracks.video.persistentTrack]);
        console.log('✅ Video attached for AI assistant:', id);
      }
      
      // Audio
      const audioEl = document.getElementById(`ai-audio-${id}`) as HTMLAudioElement;
      if (audioEl && p.tracks?.audio && p.tracks.audio.state === 'playable' && p.tracks.audio.persistentTrack) {
        audioEl.srcObject = new MediaStream([p.tracks.audio.persistentTrack]);
        console.log('✅ Audio attached for AI assistant:', id);
      }
    });
  }, [remoteParticipants]);

  // Daily.js setup
  useEffect(() => {
    if (!conversationUrl) return;

    console.log('🚀 Setting up AI Assistant with Daily.js:', conversationUrl);
    
    const call = getOrCreateCallObject();
    callRef.current = call;

    // Join meeting
    call.join({ url: conversationUrl })
      .then(() => {
        console.log('✅ AI Assistant joined Daily call');
        setCallState('joined');
        setIsConnected(true);
      })
      .catch((error: any) => {
        console.error('❌ AI Assistant failed to join:', error);
        setCallState('error');
        setIsConnecting(false);
      });

    // Event listeners
    call.on('participant-joined', (event: any) => {
      console.log('👤 AI participant joined:', event);
      updateRemoteParticipants();
      if (event.participant.user_name !== 'local') {
        setReplicaState('listening');
      }
    });

    call.on('participant-updated', updateRemoteParticipants);
    call.on('participant-left', updateRemoteParticipants);

    call.on('call-state-changed', (event: any) => {
      console.log('📞 AI call state changed:', event.state);
      setCallState(event.state);
    });

    call.on('track-started', updateRemoteParticipants);
    call.on('track-stopped', updateRemoteParticipants);

    // Handle app messages for tool calls
    call.on('app-message', (event: any) => {
      console.log('📨 AI app message received:', event);
      const { data } = event;
      
      // Parse the tool call properly
      const toolCall = parseToolCall(data);
      if (toolCall) {
        console.log('🔧 Parsed tool call:', toolCall);
        handleToolCall(toolCall);
      }
      
      // Handle other message types
      switch (data.type) {
        case 'conversation-utterance':
          if (data.utterance && data.utterance.text) {
            setTranscript(prev => prev + '\n' + data.utterance.text);
            checkForEasterEggs(data.utterance.text);
          }
          break;
          
        case 'conversation-replica-start-stop-speaking-event':
          setReplicaState(data.is_speaking ? 'speaking' : 'listening');
          break;
      }
      
      // Handle event types from webhook
      switch (data.event_type) {
        case 'conversation.replica.stopped_speaking':
          setReplicaState('listening');
          break;
          
        case 'conversation.replica.started_speaking':
          setReplicaState('speaking');
          break;
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up AI Assistant call');
      if (cartSuccessTimer) {
        clearTimeout(cartSuccessTimer);
      }
      // Don't leave the call here since it's a singleton
    };
  }, [conversationUrl]);

  const startConversation = async () => {
    if (!selectedHost) {
      console.error('No host selected');
      return;
    }

    setIsConnecting(true);
    try {
      console.log('🎬 Starting enhanced AI shopping conversation with host:', selectedHost.name);
      
      // Use custom prompt if available
      const session = await createEnhancedShoppingSession(
        'luxury shopping experience',
        'Guest',
        selectedHost.replicaId,
        selectedHost.customPrompt // Pass custom prompt if available
      );
      
      console.log('✅ Enhanced AI session created:', session);
      setConversationUrl(session.conversation_url);
      
    } catch (error) {
      console.error('❌ Error starting AI conversation:', error);
      alert('Failed to start AI assistant. Please check your configuration.');
      setIsConnecting(false);
    }
  };

  const stopConversation = async () => {
    if (callRef.current) {
      try {
        await callRef.current.leave();
      } catch (error) {
        console.error('Error leaving AI call:', error);
      }
    }
    
    setIsConnected(false);
    setConversationUrl(null);
    setCallState('idle');
    setReplicaState('connecting');
    setRemoteParticipants({});
    setShowcaseContent({ type: 'host-selection', data: null });
    setProactiveCartMessage(null);
    setSelectedHost(null);
    
    if (cartSuccessTimer) {
      clearTimeout(cartSuccessTimer);
      setCartSuccessTimer(null);
    }
  };

  const toggleMute = () => {
    if (callRef.current) {
      callRef.current.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (callRef.current) {
      callRef.current.setLocalVideo(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleCategorySelect = async (category: string) => {
    // Trigger a search for the selected category
    const searchParams = {
      category: category,
      limit: 8
    };
    
    try {
      const results = await searchProducts(searchParams);
      setShowcaseContent({
        type: 'grid',
        data: {
          products: results,
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
        }
      });
    } catch (error) {
      console.error('Category search error:', error);
    }
  };

  // Handle host selection
  const handleHostSelect = (host: Host) => {
    setSelectedHost(host);
    // Keep showing host selector until they start conversation
  };

  // Check if product is in cart
  const isProductInCart = (productId: string) => {
    return cartItems.some(item => item.id === productId);
  };

  // Dynamic showcase renderer
  const renderShowcase = () => {
    switch (showcaseContent.type) {
      case 'host-selection':
        return (
          <div className="h-full flex flex-col justify-center">
            <HostSelector 
              onHostSelect={handleHostSelect}
              selectedHost={selectedHost}
              onStartConversation={startConversation}
              isConnecting={isConnecting}
            />
          </div>
        );

      case 'product':
        const product = showcaseContent.data;
        const productInCart = isProductInCart(product.id);
        
        return (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              {/* Product Image */}
              <div className="relative">
                {show360 === product.id ? (
                  <div className="aspect-square bg-gradient-to-br from-brand-100 to-blue-100 dark:from-brand-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center border border-brand-200 dark:border-brand-700/50 relative overflow-hidden">
                    <div 
                      className="text-center text-gray-700 dark:text-gray-300 transform transition-transform duration-100"
                      style={{ transform: `rotate(${rotation360}deg)` }}
                    >
                      <RotateCcw className="w-12 h-12 mx-auto mb-2 text-brand-500" />
                      <p className="font-semibold">360° Interactive View</p>
                    </div>
                    {showDragHint && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm animate-fade-in">
                        Drag to spin
                      </div>
                    )}
                    <button 
                      onClick={() => onShow360Change(false)}
                      className="absolute top-4 right-4 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-200 underline text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
                    >
                      Exit 360° View
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={product.image || product.thumbnail} 
                      alt={product.title || product.name}
                      className="w-full aspect-square object-cover rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                      id="showcase-product-image"
                    />
                    <button
                      onClick={() => onShow360Change(product.id)}
                      className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      aria-label="View in 360 degrees"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {activeOffer && activeOffer.productId === product.id && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full animate-bounce shadow-lg text-sm font-bold">
                    {activeOffer.type === 'discount' && `${activeOffer.discount}% OFF!`}
                    {activeOffer.type === 'limited_time' && 'LIMITED TIME!'}
                    {activeOffer.type === 'exclusive' && 'EXCLUSIVE!'}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <h4 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.title || product.name}</h4>
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  ${product.price}
                </p>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(product.rating.rate) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {product.rating.rate}/5 ({product.rating.count} reviews)
                    </span>
                  </div>
                )}
                
                {product.highlightFeatures && (
                  <div className="mb-6 flex-1">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Curated Features:</h5>
                    <div className="space-y-2">
                      {product.highlightFeatures.map((feature: string, idx: number) => (
                        <motion.div 
                          key={idx} 
                          className="flex items-center space-x-2" 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <span className="text-brand-500">✨</span>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Magic Add to Cart Button */}
                <motion.button 
                  onClick={(e) => {
                    const sourceElement = e.currentTarget;
                    handleMagicAddToCart(product.id, 1, sourceElement);
                  }}
                  className={`w-full py-4 rounded-lg font-bold text-lg transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-lg ${
                    productInCart
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 cursor-default'
                      : cartAnimation 
                        ? 'bg-green-500 text-white scale-105 animate-cart-success' 
                        : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white hover:scale-105'
                  }`}
                  disabled={productInCart && !cartAnimation}
                  aria-label={`${productInCart ? 'Already in cart' : 'Add to cart'}: ${product.title || product.name}`}
                  whileHover={!productInCart ? { scale: 1.02 } : {}}
                  whileTap={!productInCart ? { scale: 0.98 } : {}}
                >
                  {productInCart ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-5 h-5" />
                      <span>✓ Added</span>
                    </div>
                  ) : cartAnimation ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span>✓</span>
                      <span>Added to Cart!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </div>
                  )}
                </motion.button>

                {/* Proactive Cart Message */}
                {proactiveCartMessage && (
                  <motion.div 
                    className="mt-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-brand-800 dark:text-brand-200 font-medium text-sm">{selectedHost?.name} says:</p>
                        <p className="text-brand-700 dark:text-brand-300 text-sm italic mt-1">"{proactiveCartMessage}"</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="animate-fade-in h-full flex flex-col">
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Curated Comparison: {showcaseContent.data.aspect}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
              {showcaseContent.data.products.map((item: any) => {
                const itemInCart = isProductInCart(item.id);
                return (
                  <div key={item.id} className="bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow h-fit">
                    <img src={item.image || item.thumbnail} alt={item.title || item.name} className="w-full h-32 object-cover rounded mb-3" />
                    <h5 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-1">{item.title || item.name}</h5>
                    <p className="text-brand-600 font-bold mb-3">${item.price}</p>
                    <motion.button 
                      onClick={(e) => {
                        if (!itemInCart) {
                          handleMagicAddToCart(item.id, 1, e.currentTarget);
                        }
                      }}
                      disabled={itemInCart}
                      className={`w-full py-2 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        itemInCart
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default'
                          : 'bg-brand-500 text-white hover:bg-brand-600'
                      }`}
                      aria-label={`${itemInCart ? 'Already in cart' : 'Add to cart'}: ${item.title || item.name}`}
                      whileHover={!itemInCart ? { scale: 1.02 } : {}}
                      whileTap={!itemInCart ? { scale: 0.98 } : {}}
                    >
                      {itemInCart ? '✓ Added' : 'Add to Cart'}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="animate-fade-in h-full flex flex-col">
            <ProductGrid 
              products={showcaseContent.data.products}
              title={showcaseContent.data.title}
              onJoinRoom={(product) => {
                // Handle quick add with magic animation
                const productElement = document.querySelector(`[data-product-id="${product.id}"]`) as HTMLElement;
                if (productElement) {
                  handleMagicAddToCart(product.id, 1, productElement);
                }
              }}
              onProductHover={() => {}}
            />
          </div>
        );

      case 'categories':
        return (
          <div className="h-full flex flex-col">
            <CategoryGridDisplay onCategorySelect={handleCategorySelect} />
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-lg mb-2">Welcome to your personal shopping experience</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {selectedHost ? `${selectedHost.name} is ready to assist you` : 'Select a host to begin your curated journey'}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Magic Cart Animation Overlay */}
      <MagicCartAnimation
        isActive={animationState.isActive}
        productImage={animationState.productImage}
        productName={animationState.productName}
        startPosition={animationState.startPosition}
        endPosition={animationState.endPosition}
        onComplete={completeMagicCart}
      />

      {/* Main Content - Optimized Layout for All Devices */}
      <div className="flex-1 flex flex-col xl:flex-row gap-4 lg:gap-6 p-4 lg:p-6 min-h-0">
        {/* AI Video Section - Responsive Width */}
        <div className="w-full xl:w-96 flex-shrink-0 order-2 xl:order-1">
          <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden h-full flex flex-col">
            <div 
              ref={videoContainerRef}
              className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center flex-1 transition-all duration-300 aspect-[9/16] xl:aspect-auto"
            >
              {/* Remote participants video/audio */}
              {Object.entries(remoteParticipants).map(([id, p]: [string, any]) => (
                <div key={id} className="w-full h-full relative">
                  <video
                    id={`ai-video-${id}`}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <audio 
                    id={`ai-audio-${id}`} 
                    autoPlay 
                    playsInline 
                  />
                </div>
              ))}
              
              {/* Connection State Overlay */}
              {(!isConnected || Object.keys(remoteParticipants).length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm z-10">
                  <div className="text-center px-4">
                    {!conversationUrl ? (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                          {selectedHost ? (
                            <img 
                              src={selectedHost.image} 
                              alt={selectedHost.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <MessageCircle className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                          {selectedHost ? `Meet ${selectedHost.name}` : 'Choose Your Host'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                          {selectedHost 
                            ? `${selectedHost.description}. Ready for your FaceTime AI call.`
                            : 'Select your personal shopping curator for a live video conversation.'
                          }
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {callState === 'joining' ? 'Joining call...' : 
                           callState === 'joined' ? `Connecting to ${selectedHost?.name}...` : 
                           callState === 'error' ? 'Connection failed' :
                           'Starting video call...'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Status Indicators */}
              {callState === 'joined' && (
                <>
                  <div className="absolute top-3 left-3 flex items-center space-x-1 z-20">
                    <div className={`w-2 h-2 rounded-full ${
                      replicaState === 'speaking' ? 'bg-brand-500 animate-pulse' :
                      replicaState === 'listening' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded-full">
                      LIVE
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/70 rounded-lg p-1 backdrop-blur-sm z-20">
                    <div className="flex items-center space-x-2 text-white text-xs">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{viewerCount}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Controls with Aria Status */}
            {isConnected && (
              <div className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
                {/* Aria Status Component */}
                <AriaStatus replicaState={replicaState} hostName={selectedHost?.name} />
                
                {/* Control Buttons */}
                <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleMute}
                        className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600 dark:bg-gray-700'} text-white hover:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500`}
                        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                      >
                        {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={toggleVideo}
                        className={`p-2 rounded-full ${!isVideoEnabled ? 'bg-red-500' : 'bg-gray-600 dark:bg-gray-700'} text-white hover:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500`}
                        aria-label={!isVideoEnabled ? 'Enable audio' : 'Disable audio'}
                      >
                        {!isVideoEnabled ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={stopConversation}
                        className="p-2 rounded-full bg-red-600 text-white hover:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="End conversation"
                      >
                        <Pause className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                      Video Call with {selectedHost?.name || 'AI'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Showcase (Flexible Width) */}
        <div className="flex-1 min-w-0 order-1 xl:order-2">
          <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl shadow-lg border overflow-hidden h-full flex flex-col transition-all duration-1000 ${
            showcaseGlow 
              ? 'border-brand-400 shadow-brand-200 dark:shadow-brand-500/20 shadow-2xl animate-pulse-glow' 
              : 'border-white/20 dark:border-gray-700/20'
          }`}>
            <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-brand-500" />
                <span>
                  {showcaseContent.type === 'host-selection' 
                    ? 'Host Selection' 
                    : selectedHost 
                      ? `${selectedHost.name}'s Dynamic Showcase`
                      : 'Dynamic Showcase'
                  }
                </span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {showcaseContent.type === 'host-selection' 
                  ? 'Choose your AI curator and customize their personality'
                  : 'Live product demonstrations and curated recommendations'
                }
              </p>
            </div>
            
            <div className="p-4 lg:p-6 flex-1 min-h-0 overflow-y-auto">
              {renderShowcase()}

              {/* Live Transcript */}
              {transcript && (
                <div className="mt-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <h5 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-2">Live Conversation</h5>
                  <div className="text-gray-700 dark:text-gray-300 text-xs max-h-24 overflow-y-auto">
                    {transcript.split('\n').slice(-3).map((line, idx) => (
                      <p key={idx} className="mb-1">{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIShoppingAssistant;