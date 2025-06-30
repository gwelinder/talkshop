import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, ShoppingCart, Eye, Heart, 
  RotateCcw, Maximize, Zap, Sparkles, MessageCircle, Play, Pause, Search, Star,
  User, Wand2, ArrowRight, ShoppingBag, Lightbulb, Brain, Shirt, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createEnhancedShoppingSession, updatePersonaWithDynamicTools } from '../services/enhancedTavusService';
import { searchProducts, getProductById, createDynamicFashionProduct } from '../services/productService';
import AriaStatus from './AriaStatus';
import HostSelector from './HostSelector';
import ProductGrid from './ProductGrid';
import CategoryGridDisplay from './CategoryGridDisplay';
import UserInput from './UserInput';
import MagicCartAnimation from './MagicCartAnimation';
import { useMagicCart } from '../hooks/useMagicCart';
import PerceptionNotification from './PerceptionNotification';
import DailyIframe from '@daily-co/daily-js';

interface AIShoppingAssistantProps {
  allProducts: any[];
  onToolCall: (toolCall: any) => void;
  addToCart: (productId: string, quantity: number) => void;
  spotlightProduct: any;
  comparisonProducts: any[];
  activeOffer: any;
  show360: string | false;
  onShow360Change: (productId: string | false) => void;
  cartItems: any[];
  onCartJiggle: () => void;
  sessionType?: 'voice' | 'video';
  userTier?: string;
  userId?: string;
  userProfile?: any;
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
  cartItems,
  onCartJiggle,
  sessionType,
  userTier = 'free',
  userId = '',
  userProfile
}) => {
  // Connection and conversation state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [showHostSelector, setShowHostSelector] = useState(true);
  
  // AI state
  const [replicaState, setReplicaState] = useState<'connecting' | 'listening' | 'speaking'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [transcript, setTranscript] = useState<string>('');
  
  // UI state
  const [cartAnimation, setCartAnimation] = useState(false);
  const [cartSuccessTimer, setCartSuccessTimer] = useState<NodeJS.Timeout | null>(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showcaseGlow, setShowcaseGlow] = useState(false);
  const [focusedProductId, setFocusedProductId] = useState<string | null>(null);
  
  // Product display state with proper typing
  const [showcaseContent, setShowcaseContent] = useState<{
    type: 'empty' | 'product_grid' | 'categories' | 'spotlight' | 'comparison';
    data?: any;
  }>({ type: 'empty' });
  
  // Style analysis state
  const [styleAnalysisData, setStyleAnalysisData] = useState<any>(null);
  const [objectAnalysisData, setObjectAnalysisData] = useState<any>(null);
  
  // Perception notification state
  const [showPerceptionNotification, setShowPerceptionNotification] = useState(false);
  const [perceptionData, setPerceptionData] = useState<any>(null);
  const [perceptionType, setPerceptionType] = useState<'style' | 'object'>('style');
  
  // Daily.js state
  const callRef = useRef<any>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<any>({});
  const [callState, setCallState] = useState<string>('idle');
  
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Magic cart animation
  const { animationState, triggerMagicCart, completeMagicCart } = useMagicCart();

  // Perception throttling
  const lastPerceptionTime = useRef<number>(0);
  const PERCEPTION_THROTTLE_MS = 5000; // 5 seconds between perception calls

  // Update persona tools on component mount
  useEffect(() => {
    updatePersonaWithDynamicTools().catch(console.error);
  }, []);

  // Trigger showcase glow effect when spotlight product changes
  useEffect(() => {
    if (spotlightProduct) {
      setShowcaseGlow(true);
      setShowcaseContent({ type: 'spotlight', data: spotlightProduct });
      const timer = setTimeout(() => setShowcaseGlow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [spotlightProduct]);

  // Update showcase content when comparison products change
  useEffect(() => {
    if (comparisonProducts.length > 0) {
      setShowcaseContent({ type: 'comparison', data: comparisonProducts });
    }
  }, [comparisonProducts]);

  // Enhanced tool call handler with optimized cart experience
  const handleToolCall = useCallback(async (toolCall: any) => {
    console.log('🔧 Fashion Assistant processing tool call:', toolCall);
    
    // Handle cart animation with enhanced experience
    if (toolCall.function.name === 'add_to_cart' || toolCall.function.name === 'proactively_add_to_cart') {
      setCartAnimation(true);
      onCartJiggle();
      
      // Clear existing timer
      if (cartSuccessTimer) {
        clearTimeout(cartSuccessTimer);
      }
      
      // Enhanced cart success animation
      const timer = setTimeout(() => {
        setCartAnimation(false);
        setCartSuccessTimer(null);
      }, 2000); // Longer for better UX
      
      setCartSuccessTimer(timer);

      // Trigger magic cart animation if we have a product
      if (spotlightProduct) {
        const productElement = document.querySelector('[data-product-showcase]') as HTMLElement;
        if (productElement) {
          triggerMagicCart(
            spotlightProduct.image || spotlightProduct.thumbnail,
            spotlightProduct.title || spotlightProduct.name,
            productElement
          );
        }
      }
    }
    
    // Handle search products tool
    if (toolCall.function.name === 'search_products') {
      setIsSearching(true);
      try {
        const searchParams = {
          search: toolCall.function.arguments.search_query,
          category: toolCall.function.arguments.category,
          minPrice: toolCall.function.arguments.min_price,
          maxPrice: toolCall.function.arguments.max_price,
          limit: 8
        };
        
        const results = await searchProducts(searchParams);
        setSearchResults(results);
        console.log('🔍 Search results:', results);
        
        // Display results in product grid
        if (results.length > 0) {
          setShowcaseContent({
            type: 'product_grid',
            data: {
              products: results,
              title: `Found ${results.length} items matching "${searchParams.search}"`
            }
          });
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
      return; // Don't forward search tool calls to parent
    }

    // Handle product grid display
    if (toolCall.function.name === 'show_product_grid') {
      const { products, collection_title, style_narrative } = toolCall.function.arguments;
      setShowcaseContent({ 
        type: 'product_grid', 
        data: { 
          products, 
          title: collection_title || 'Curated Collection',
          narrative: style_narrative
        } 
      });
      return; // Don't forward to parent
    }

    // Handle category display
    if (toolCall.function.name === 'show_categories') {
      setShowcaseContent({ type: 'categories' });
      return; // Don't forward to parent
    }

    // Handle dynamic product creation
    if (toolCall.function.name === 'create_dynamic_product') {
      console.log('🎨 Creating dynamic fashion product:', toolCall.function.arguments);
      const { product_description, style_reasoning, occasion, price_range } = toolCall.function.arguments;
      
      try {
        // Create dynamic product
        const dynamicProduct = createDynamicFashionProduct(product_description, {
          description: style_reasoning,
          occasion: occasion,
          price_range: price_range,
          gender_preference: userProfile?.gender || userProfile?.preferences?.gender_preference
        });
        
        // Show the product
        setSpotlightProduct({
          ...dynamicProduct,
          highlightFeatures: [
            style_reasoning,
            `Perfect for ${occasion || 'any occasion'}`,
            `${price_range || 'Premium'} quality`
          ],
          stylingTips: [
            `Pairs well with ${dynamicProduct.category === "men's clothing" ? "dark jeans and loafers" : "slim pants and heels"}`,
            `Layer with ${dynamicProduct.category === "men's clothing" ? "a light jacket" : "a cardigan"} for cooler weather`,
            `Add ${dynamicProduct.category === "men's clothing" ? "a watch" : "statement earrings"} to complete the look`
          ]
        });
        
        setShowcaseContent({ type: 'spotlight', data: dynamicProduct });
      } catch (error) {
        console.error('Error creating dynamic product:', error);
      }
      
      return; // Don't forward to parent
    }

    // Handle the RESOLVER TOOL - find_and_display_style_matches
    if (toolCall.function.name === 'find_and_display_style_matches') {
      console.log('🎨 RESOLVER: Processing style matches:', toolCall.function.arguments);
      const { dominant_color, style_category, curation_title, style_personality } = toolCall.function.arguments;
      
      // Store the complete style analysis data
      setStyleAnalysisData({
        dominant_color,
        style_category,
        style_personality
      });
      
      // Auto-search based on style analysis
      if (dominant_color && style_category) {
        const searchQuery = `${style_category} ${dominant_color}`;
        try {
          const results = await searchProducts({ 
            search: searchQuery, 
            limit: 6,
            gender: userProfile?.gender || userProfile?.preferences?.gender_preference
          });
          
          if (results.length > 0) {
            setShowcaseContent({
              type: 'product_grid',
              data: {
                products: results,
                title: curation_title || `Based on your ${style_category} ${dominant_color} style, here are pieces I think you'll adore`
              }
            });
          } else {
            console.log('🎨 No existing products found, creating dynamic products for:', searchQuery);
            
            // Create dynamic products based on style analysis
            const dynamicProducts = [];
            const variations = [
              `${dominant_color} ${style_category}`,
              `${dominant_color} ${style_category} top`,
              `${dominant_color} ${style_category} dress`,
              `${dominant_color} ${style_category} jacket`
            ];
            
            for (let i = 0; i < Math.min(4, variations.length); i++) {
              try {
                const dynamicProduct = createDynamicFashionProduct(variations[i], {
                  gender_preference: userProfile?.gender || userProfile?.preferences?.gender_preference
                });
                dynamicProducts.push(dynamicProduct);
              } catch (error) {
                console.error('Error creating dynamic product:', error);
              }
            }
            
            setShowcaseContent({
              type: 'product_grid',
              data: {
                products: dynamicProducts,
                title: curation_title || `Based on your ${style_category} ${dominant_color} style, here are pieces I think you'll adore`
              }
            });
          }
        } catch (error) {
          console.error('Error searching for style matches:', error);
        }
      }
      return; // Don't forward to parent
    }

    // Handle create_complete_outfit
    if (toolCall.function.name === 'create_complete_outfit') {
      console.log('👗 Creating complete outfit:', toolCall.function.arguments);
      const { base_item, occasion, style_preference, budget_range } = toolCall.function.arguments;
      
      try {
        // Create 3-5 dynamic products for a complete outfit
        const outfitPieces = [];
        
        // Determine if we're creating men's or women's outfit
        const genderPreference = userProfile?.gender || userProfile?.preferences?.gender_preference || 'women';
        
        // Create outfit pieces based on gender preference
        const outfitItems = genderPreference === 'men' ? 
          [`${style_preference} ${base_item}`, `${style_preference} shirt`, `${style_preference} pants`, `${style_preference} shoes`, `${style_preference} accessory`] :
          [`${style_preference} ${base_item}`, `${style_preference} top`, `${style_preference} bottom`, `${style_preference} shoes`, `${style_preference} accessory`];
        
        for (let i = 0; i < outfitItems.length; i++) {
          try {
            const dynamicProduct = createDynamicFashionProduct(outfitItems[i], {
              occasion: occasion,
              gender_preference: genderPreference
            });
            outfitPieces.push(dynamicProduct);
          } catch (error) {
            console.error('Error creating outfit piece:', error);
          }
        }
        
        // Display the outfit as a product grid
        setShowcaseContent({
          type: 'product_grid',
          data: {
            products: outfitPieces,
            title: `Complete ${style_preference} Outfit for ${occasion}`,
            narrative: `This curated outfit is perfect for ${occasion}, featuring a ${style_preference} aesthetic that works beautifully together.`
          }
        });
      } catch (error) {
        console.error('Error creating complete outfit:', error);
      }
      
      return; // Don't forward to parent
    }

    // Handle object analysis (perception tool)
    if (toolCall.function.name === 'analyze_object_in_view') {
      console.log('🔍 Processing object analysis:', toolCall.function.arguments);
      setObjectAnalysisData(toolCall.function.arguments);
      
      // Auto-search for complementary products
      if (toolCall.function.arguments.dominant_color && toolCall.function.arguments.object_category) {
        const searchQuery = `${toolCall.function.arguments.object_category} ${toolCall.function.arguments.dominant_color}`;
        const results = await searchProducts({ search: searchQuery, limit: 6 });
        
        if (results.length > 0) {
          setShowcaseContent({
            type: 'product_grid',
            data: {
              products: results,
              title: `Products that complement your ${toolCall.function.arguments.object_description}`
            }
          });
        }
      }
      return; // Don't forward to parent
    }

    // Handle focus on product
    if (toolCall.function.name === 'focus_on_product') {
      console.log('🎯 Focusing on product:', toolCall.function.arguments);
      setFocusedProductId(toolCall.function.arguments.product_id);
      
      // Clear focus after 5 seconds
      setTimeout(() => {
        setFocusedProductId(null);
      }, 5000);
      return; // Don't forward to parent
    }
    
    // Forward other tool calls to parent component
    onToolCall(toolCall);
  }, [onToolCall, cartSuccessTimer, onCartJiggle, spotlightProduct, triggerMagicCart, userProfile]);

  // Enhanced tool call parsing with perception throttling
  const parseToolCall = useCallback((data: any) => {
    try {
      console.log('🔧 Parsing tool call data:', data);
      
      // Handle conversation tool calls (from app messages)
      if (data.type === 'conversation-toolcall' && data.tool_call) {
        return data.tool_call;
      }
      
      // Handle tool calls from webhook events
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

      // Handle perception tool calls with throttling and notification
      if (data.event_type === 'conversation.perception_tool_call' && data.properties) {
        const { name, arguments: args } = data.properties;
        
        // Throttle perception calls to prevent spam
        const now = Date.now();
        if (now - lastPerceptionTime.current < PERCEPTION_THROTTLE_MS) {
          console.log('🚫 Perception call throttled');
          return null;
        }
        
        // For style detection, show notification instead of immediate processing
        if (name === 'detected_user_style') {
          console.log('🎨 Step 1: Style detection completed:', args);
          lastPerceptionTime.current = now;
          
          // Show notification instead of immediate processing
          setPerceptionData(args);
          setPerceptionType('style');
          setShowPerceptionNotification(true);
          
          return null; // Don't process as regular tool call
        }
        
        lastPerceptionTime.current = now;
        return {
          function: {
            name: name,
            arguments: args
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing tool call:', error);
      return null;
    }
  }, []);

  // Handle perception notification actions
  const handlePerceptionAction = useCallback((action: 'analyze' | 'dismiss') => {
    if (action === 'analyze') {
      // Process the perception data
      if (perceptionType === 'style' && perceptionData) {
        // Trigger the RESOLVER TOOL
        const resolverToolCall = {
          function: {
            name: 'find_and_display_style_matches',
            arguments: {
              dominant_color: perceptionData.dominant_color,
              style_category: perceptionData.style_category,
              style_personality: 'Stylish individual',
              curation_title: `Inspired by your ${perceptionData.style_category} ${perceptionData.dominant_color} style`
            }
          }
        };
        handleToolCall(resolverToolCall);
      } else if (perceptionType === 'object' && perceptionData) {
        // Process object analysis
        handleToolCall({
          function: {
            name: 'analyze_object_in_view',
            arguments: perceptionData
          }
        });
      }
    }
    
    // Close the notification
    setShowPerceptionNotification(false);
    setPerceptionData(null);
  }, [perceptionType, perceptionData, handleToolCall]);

  // Update remote participants
  const updateRemoteParticipants = useCallback(() => {
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
  }, []);

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
        setShowHostSelector(false); // Hide host selector when connected
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

        case 'conversation.tool_call':
          console.log('📨 AI tool call received:', data);
          const webhookToolCall = parseToolCall(data);
          if (webhookToolCall) {
            console.log('🔧 Parsed tool call:', webhookToolCall);
            handleToolCall(webhookToolCall);
          }
          break;

        case 'conversation.perception_tool_call':
          console.log('👁️ AI perception tool call received:', data);
          const perceptionToolCall = parseToolCall(data);
          if (perceptionToolCall) {
            console.log('🔧 Parsed perception tool call:', perceptionToolCall);
            handleToolCall(perceptionToolCall);
          }
          break;
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up AI Assistant call');
      if (cartSuccessTimer) {
        clearTimeout(cartSuccessTimer);
      }
    };
  }, [conversationUrl, updateRemoteParticipants, parseToolCall, handleToolCall, cartSuccessTimer]);

  const startConversation = async () => {
    if (!selectedHost) return;
    
    setIsConnecting(true);
    try {
      console.log('🎬 Starting personalized fashion styling session for:', userProfile?.username || 'Guest');
      console.log('👤 User profile:', userProfile);
      
      const session = await createEnhancedShoppingSession(
        'personal style consultation',
        userProfile?.username || 'Guest',
        selectedHost.replicaId,
        selectedHost.customPrompt,
        showcaseContent.type, // Pass current UI state
        userProfile?.gender || userProfile?.preferences?.gender_preference // Pass gender preference
      );
      
      console.log('✅ Personalized fashion session created:', session);
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
    setSearchResults([]);
    setShowHostSelector(true); // Show host selector again
    setShowcaseContent({ type: 'empty' });
    setStyleAnalysisData(null);
    setObjectAnalysisData(null);
    setFocusedProductId(null);
    setShowPerceptionNotification(false);
    setPerceptionData(null);
    
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
    const results = await searchProducts({ category, limit: 8 });
    setShowcaseContent({
      type: 'product_grid',
      data: {
        products: results,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
      }
    });
  };

  const handleUserMessage = (message: string) => {
    // This would send the message to the AI
    console.log('User message:', message);
    // In a real implementation, this would use Daily's sendAppMessage
    if (callRef.current) {
      callRef.current.sendAppMessage({
        type: 'user-message',
        message: message
      });
    }
  };

  const handleInputFocus = () => {
    // Show some helpful suggestions when user focuses on input
    if (showcaseContent.type === 'empty') {
      setShowcaseContent({ type: 'categories' });
    }
  };

  // Show host selector if not connected
  if (showHostSelector) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full h-full">
          <HostSelector
            onHostSelect={setSelectedHost}
            selectedHost={selectedHost}
            onStartConversation={startConversation}
            isConnecting={isConnecting}
          />
        </div>
      </div>
    );
  }

  // Render showcase content based on current state
  const renderShowcaseContent = () => {
    switch (showcaseContent.type) {
      case 'product_grid':
        return (
          <div className="animate-fade-in flex-1">
            {/* Style Analysis Display */}
            {styleAnalysisData && (
              <motion.div 
                className="mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4 className="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center space-x-2">
                  <Wand2 className="w-4 h-4" />
                  <span>Style Analysis Complete</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-purple-700 dark:text-purple-300 font-medium">Color:</span>
                    <p className="text-purple-900 dark:text-purple-100 capitalize">{styleAnalysisData.dominant_color || 'Not detected'}</p>
                  </div>
                  <div>
                    <span className="text-purple-700 dark:text-purple-300 font-medium">Style:</span>
                    <p className="text-purple-900 dark:text-purple-100 capitalize">{styleAnalysisData.style_category || 'Not detected'}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Object Analysis Display */}
            {objectAnalysisData && (
              <motion.div 
                className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Object Detected</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Description:</span>
                    <p className="text-blue-900 dark:text-blue-100">{objectAnalysisData.object_description}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Color:</span>
                    <p className="text-blue-900 dark:text-blue-100 capitalize">{objectAnalysisData.dominant_color}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Category:</span>
                    <p className="text-blue-900 dark:text-blue-100 capitalize">{objectAnalysisData.object_category}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <ProductGrid
              products={showcaseContent.data.products}
              title={showcaseContent.data.title}
              onProductSelect={(product) => addToCart(product.id, 1)}
              focusedProductId={focusedProductId}
            />
          </div>
        );

      case 'categories':
        return (
          <div className="animate-fade-in flex-1">
            <CategoryGridDisplay onCategorySelect={handleCategorySelect} />
          </div>
        );

      case 'spotlight':
        return (
          <div className="animate-fade-in flex-1" data-product-showcase>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="relative">
                <img 
                  src={spotlightProduct.image || spotlightProduct.thumbnail} 
                  alt={spotlightProduct.title || spotlightProduct.name}
                  className="w-full aspect-square object-cover rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                />
                
                {activeOffer && activeOffer.productId === spotlightProduct.id && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full animate-bounce shadow-lg text-sm font-bold">
                    {activeOffer.type === 'discount' && `${activeOffer.discount}% OFF!`}
                    {activeOffer.type === 'limited_time' && 'LIMITED TIME!'}
                    {activeOffer.type === 'exclusive' && 'EXCLUSIVE!'}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{spotlightProduct.title || spotlightProduct.name}</h4>
                <p className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  ${spotlightProduct.price}
                </p>
                
                {/* Rating */}
                {spotlightProduct.rating && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(spotlightProduct.rating.rate) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {spotlightProduct.rating.rate}/5 ({spotlightProduct.rating.count} reviews)
                    </span>
                  </div>
                )}
                
                {/* Fashion-specific details */}
                {spotlightProduct.material && (
                  <div className="mb-3">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Material: </span>
                    <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">{spotlightProduct.material}</span>
                  </div>
                )}
                
                {spotlightProduct.color_options && spotlightProduct.color_options.length > 0 && (
                  <div className="mb-3">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Available Colors: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {spotlightProduct.color_options.map((color: string, idx: number) => (
                        <span 
                          key={idx}
                          className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {spotlightProduct.size_options && spotlightProduct.size_options.length > 0 && (
                  <div className="mb-3">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">Available Sizes: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {spotlightProduct.size_options.map((size: string, idx: number) => (
                        <span 
                          key={idx}
                          className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {spotlightProduct.highlightFeatures && (
                  <div className="mb-4 flex-1">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Features:</h5>
                    <div className="space-y-2">
                      {spotlightProduct.highlightFeatures.map((feature: string, idx: number) => (
                        <div 
                          key={idx} 
                          className="flex items-center space-x-2 animate-fade-in" 
                          style={{animationDelay: `${idx * 0.1}s`}}
                        >
                          <span className="text-brand-500">✨</span>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Styling Tips */}
                {spotlightProduct.stylingTips && spotlightProduct.stylingTips.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Styling Tips:</h5>
                    <div className="space-y-2">
                      {spotlightProduct.stylingTips.map((tip: string, idx: number) => (
                        <div 
                          key={idx} 
                          className="flex items-center space-x-2 animate-fade-in" 
                          style={{animationDelay: `${idx * 0.1 + 0.3}s`}}
                        >
                          <span className="text-purple-500">👗</span>
                          <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => addToCart(spotlightProduct.id, 1)}
                  className={`w-full py-4 rounded-lg text-white font-bold text-lg transform transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    cartAnimation 
                      ? 'bg-green-500 scale-105 shadow-green-500/50 shadow-2xl' 
                      : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 hover:scale-105'
                  } shadow-lg`}
                  aria-label={`Add ${spotlightProduct.title || spotlightProduct.name} to cart`}
                >
                  <AnimatePresence mode="wait">
                    {cartAnimation ? (
                      <motion.div 
                        className="flex items-center justify-center space-x-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          ✓
                        </motion.span>
                        <span>Added to Cart!</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center justify-center space-x-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="animate-fade-in flex-1">
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Style Comparison</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {comparisonProducts.map((item) => (
                <div key={item.id} className="bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <img src={item.image || item.thumbnail} alt={item.title || item.name} className="w-full h-32 object-cover rounded mb-3" />
                  <h5 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-1">{item.title || item.name}</h5>
                  <p className="text-brand-600 font-bold mb-3">${item.price}</p>
                  <button 
                    onClick={() => addToCart(item.id, 1)}
                    className="w-full bg-brand-500 text-white py-2 rounded text-sm hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                    aria-label={`Add ${item.title || item.name} to cart`}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-6">
              <div className="text-6xl mb-4">✨</div>
              <h4 className="text-xl font-semibold mb-2">Ready to discover your personal style?</h4>
              <p className="text-base text-gray-400 dark:text-gray-500 mb-6">
                {selectedHost?.name} will guide you through a personalized fashion experience
              </p>
            </div>

            {/* Helpful Fashion Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 max-w-md">
              <h5 className="text-blue-900 dark:text-blue-100 font-semibold mb-3 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span>Try asking:</span>
              </h5>
              <div className="space-y-2 text-blue-800 dark:text-blue-200 text-base">
                <p>• "Shop my style" - for personalized recommendations</p>
                <p>• "Create a capsule wardrobe for me" - for versatile essentials</p>
                <p>• "What should I wear to a wedding?" - for occasion styling</p>
                <p>• "Help me find a perfect black dress" - for specific items</p>
                <p>• "What colors complement my style?" - for color advice</p>
              </div>
            </div>

            {/* User Input */}
            <div className="mt-6 w-full max-w-2xl">
              <UserInput
                onMessageSend={handleUserMessage}
                onFocus={handleInputFocus}
                disabled={!isConnected}
                placeholder={`Ask ${selectedHost?.name} about fashion, styles, or personal styling...`}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Magic Cart Animation */}
      <MagicCartAnimation
        isActive={animationState.isActive}
        productImage={animationState.productImage}
        productName={animationState.productName}
        startPosition={animationState.startPosition}
        endPosition={animationState.endPosition}
        onComplete={completeMagicCart}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
              Styling with {selectedHost?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Your personal {selectedHost?.description}
            </p>
          </motion.div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Video Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden">
              <div 
                ref={videoContainerRef}
                className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center aspect-[9/16]"
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
                      <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                        Connecting to {selectedHost?.name}...
                      </h3>
                      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {callState === 'joining' ? 'Joining...' : 
                         callState === 'joined' ? `Waiting for ${selectedHost?.name}...` : 
                         callState === 'error' ? 'Connection failed' :
                         'Connecting...'}
                      </p>
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
                  </>
                )}
              </div>
              
              {/* Controls with Aria Status */}
              {isConnected && (
                <div className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
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
                        {selectedHost?.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Product Showcase */}
          <div className="lg:col-span-2">
            <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl shadow-lg border overflow-hidden transition-all duration-1000 ${
              showcaseGlow 
                ? 'border-brand-400 shadow-brand-200 dark:shadow-brand-500/20 shadow-2xl animate-pulse-glow' 
                : 'border-white/20 dark:border-gray-700/20'
            }`}>
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <Shirt className="w-5 h-5 text-brand-500" />
                  <span>Fashion Showcase</span>
                  {isSearching && (
                    <div className="flex items-center space-x-2 text-brand-500">
                      <Search className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Curating...</span>
                    </div>
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {selectedHost?.name} curates personalized fashion recommendations just for you
                </p>
              </div>
              
              <div className="p-6 min-h-[500px] flex flex-col">
                {renderShowcaseContent()}

                {/* Live Transcript */}
                {transcript && (
                  <div className="mt-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
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

      {/* Perception Notification - Floating and Less Intrusive */}
      <AnimatePresence>
        {showPerceptionNotification && perceptionData && (
          <motion.div 
            className="fixed bottom-4 right-4 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <PerceptionNotification
              type={perceptionType}
              data={perceptionData}
              onAction={handlePerceptionAction}
              onClose={() => setShowPerceptionNotification(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIShoppingAssistant;