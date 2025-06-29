import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, ShoppingCart, Eye, Heart, 
  RotateCcw, Maximize, Zap, Sparkles, MessageCircle, Play, Pause, Search, Star 
} from 'lucide-react';
import { createEnhancedShoppingSession, updatePersonaWithDynamicTools } from '../services/enhancedTavusService';
import { searchProducts, getProductById } from '../services/productService';
import AriaStatus from './AriaStatus';
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
  onShow360Change
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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showcaseGlow, setShowcaseGlow] = useState(false);
  const [rotation360, setRotation360] = useState(0);
  const [showDragHint, setShowDragHint] = useState(true);
  
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

  // Trigger showcase glow effect when spotlight product changes
  useEffect(() => {
    if (spotlightProduct) {
      setShowcaseGlow(true);
      const timer = setTimeout(() => setShowcaseGlow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [spotlightProduct]);

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
      onToolCall({
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

  // Enhanced tool call handler with API integration
  const handleToolCall = async (toolCall: any) => {
    console.log('🔧 AI Assistant received tool call:', toolCall);
    
    // Handle cart animation with persistent success state
    if (toolCall.function.name === 'add_to_cart') {
      setCartAnimation(true);
      
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
    
    // Handle search products tool
    if (toolCall.function.name === 'search_products') {
      setIsSearching(true);
      try {
        const searchParams = {
          search: toolCall.function.arguments.search_query,
          category: toolCall.function.arguments.category,
          minPrice: toolCall.function.arguments.min_price,
          maxPrice: toolCall.function.arguments.max_price,
          limit: 6
        };
        
        const results = await searchProducts(searchParams);
        setSearchResults(results);
        console.log('🔍 Search results:', results);
        
        // Auto-show first result if available
        if (results.length > 0) {
          const firstResult = results[0];
          onToolCall({
            function: {
              name: 'show_product',
              arguments: {
                product_id: firstResult.id,
                product_name: firstResult.title,
                highlight_features: firstResult.features || ['High quality', 'Great value', 'Customer favorite']
              }
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
    
    // Forward other tool calls to parent component
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
    setIsConnecting(true);
    try {
      console.log('🎬 Starting enhanced AI shopping conversation...');
      
      const session = await createEnhancedShoppingSession(
        'luxury shopping experience',
        'Guest'
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
    setSearchResults([]);
    
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

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4 flex items-center justify-center space-x-3">
          <Sparkles className="w-8 h-8 text-brand-500" />
          <span>Meet Aria, Your AI Shopping Assistant</span>
          <Sparkles className="w-8 h-8 text-brand-600" />
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          Experience luxury shopping with our world-renowned AI curator who transforms product discovery into an art form
        </p>
      </div>

      {/* Premium Layout - Vertical Video */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Video Section - Vertical 9:16 */}
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
                
                {/* Connection State Overlay - Fixed: Only show when not connected OR no participants */}
                {(!isConnected || Object.keys(remoteParticipants).length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm z-10">
                    <div className="text-center px-4">
                      {!conversationUrl ? (
                        <>
                          <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <MessageCircle className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Ready for a Curated Experience?</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                            Meet Aria, your personal curator who transforms shopping into an art form. 
                            Discover products through sophisticated storytelling and expert guidance.
                          </p>
                          <button
                            onClick={startConversation}
                            disabled={isConnecting}
                            className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 mx-auto shadow-lg text-sm transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            aria-label="Start AI shopping experience"
                          >
                            {isConnecting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Connecting to Aria...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                <span>Begin Curated Experience</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {callState === 'joining' ? 'Joining...' : 
                             callState === 'joined' ? 'Waiting for Aria...' : 
                             callState === 'error' ? 'Connection failed' :
                             'Connecting...'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Status Indicators - Fixed: Only show when connected */}
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
                <div className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
                  {/* Aria Status Component */}
                  <AriaStatus replicaState={replicaState} />
                  
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
                        Curated by Aria
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Product Showcase with Glow Effect */}
          <div className="lg:col-span-2">
            <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl shadow-lg border overflow-hidden transition-all duration-1000 ${
              showcaseGlow 
                ? 'border-brand-400 shadow-brand-200 dark:shadow-brand-500/20 shadow-2xl animate-pulse-glow' 
                : 'border-white/20 dark:border-gray-700/20'
            }`}>
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-brand-500" />
                  <span>Live Product Showcase</span>
                  {isSearching && (
                    <div className="flex items-center space-x-2 text-brand-500">
                      <Search className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Curating...</span>
                    </div>
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  Aria curates and presents products with sophisticated storytelling and expert insights
                </p>
              </div>
              
              <div className="p-6 min-h-[500px] flex flex-col">
                {spotlightProduct ? (
                  <div className="animate-fade-in flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Image */}
                      <div className="relative">
                        {show360 === spotlightProduct.id ? (
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
                              src={spotlightProduct.image || spotlightProduct.thumbnail} 
                              alt={spotlightProduct.title || spotlightProduct.name}
                              className="w-full aspect-square object-cover rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                            />
                            <button
                              onClick={() => onShow360Change(spotlightProduct.id)}
                              className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                              aria-label="View in 360 degrees"
                            >
                              <Maximize className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
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
                        
                        {spotlightProduct.highlightFeatures && (
                          <div className="mb-6 flex-1">
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Curated Features:</h5>
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

                        <button 
                          onClick={() => addToCart(spotlightProduct.id, 1)}
                          className={`w-full py-4 rounded-lg text-white font-bold text-lg transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                            cartAnimation 
                              ? 'bg-green-500 scale-105 animate-cart-success' 
                              : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 hover:scale-105'
                          } shadow-lg`}
                          aria-label={`Add ${spotlightProduct.title || spotlightProduct.name} to cart`}
                        >
                          {cartAnimation ? (
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
                        </button>
                      </div>
                    </div>
                  </div>
                ) : comparisonProducts.length > 0 ? (
                  <div className="animate-fade-in flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Curated Comparison</h4>
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
                ) : searchResults.length > 0 ? (
                  <div className="animate-fade-in flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Curated Selection</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {searchResults.map((item: any) => (
                        <div key={item.id} className="bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded mb-3" />
                          <h5 className="text-gray-900 dark:text-gray-100 font-semibold text-sm mb-1 line-clamp-2">{item.title}</h5>
                          <p className="text-brand-600 font-bold mb-2">${item.price}</p>
                          <div className="flex items-center space-x-1 mb-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{item.rating.rate}/5</span>
                          </div>
                          <button 
                            onClick={() => addToCart(item.id, 1)}
                            className="w-full bg-brand-500 text-white py-2 rounded text-sm hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                            aria-label={`Add ${item.title} to cart`}
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-6xl mb-4">✨</div>
                      <p className="text-lg mb-2">Begin your curated experience</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Aria will guide you through our collection with sophisticated storytelling and expert insights</p>
                    </div>
                  </div>
                )}

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
    </div>
  );
};

export default AIShoppingAssistant;