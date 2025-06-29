import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Eye, Heart, RotateCcw, Maximize, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { createShoppingSession } from '../services/tavusService';
import DailyIframe from '@daily-co/daily-js';

interface ShoppingRoomProps {
  product: any;
  allProducts: any[];
  addToCart: (productId: string, quantity: number) => void;
  onClose: () => void;
}

// Singleton call object as recommended by Tavus
const getOrCreateCallObject = () => {
  if (!(window as any)._dailyCallObject) {
    (window as any)._dailyCallObject = DailyIframe.createCallObject();
  }
  return (window as any)._dailyCallObject;
};

const ShoppingRoom: React.FC<ShoppingRoomProps> = ({ 
  product, 
  allProducts, 
  addToCart, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [spotlightProduct, setSpotlightProduct] = useState(product);
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [show360, setShow360] = useState(false);
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [replicaState, setReplicaState] = useState<'connecting' | 'listening' | 'speaking'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [transcript, setTranscript] = useState<string>('');
  
  // Daily.js state following Tavus pattern
  const callRef = useRef<any>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<any>({});
  const [callState, setCallState] = useState<string>('idle');
  
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Simulate live viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle tool calls from Tavus AI
  const handleToolCall = (toolCall: any) => {
    console.log('Tool called:', toolCall);
    
    switch (toolCall.function.name) {
      case 'show_product':
        const foundProduct = allProducts.find(p => p.id === toolCall.function.arguments.product_id);
        if (foundProduct) {
          setSpotlightProduct({
            ...foundProduct,
            highlightFeatures: toolCall.function.arguments.highlight_features
          });
          setComparisonProducts([]);
        }
        break;
        
      case 'compare_products':
        const compareItems = toolCall.function.arguments.product_ids
          .map((id: string) => allProducts.find(p => p.id === id))
          .filter(Boolean);
        setComparisonProducts(compareItems);
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
        setCartAnimation(true);
        setTimeout(() => setCartAnimation(false), 2000);
        break;
        
      case 'show_360_view':
        setShow360(toolCall.function.arguments.product_id);
        break;
    }
  };

  // Update remote participants following Tavus example
  const updateRemoteParticipants = () => {
    if (!callRef.current) return;
    
    const participants = callRef.current.participants();
    const remotes: any = {};
    
    Object.entries(participants).forEach(([id, p]: [string, any]) => {
      if (id !== 'local') {
        remotes[id] = p;
      }
    });
    
    console.log('Remote participants updated:', remotes);
    setRemoteParticipants(remotes);
  };

  // Attach video and audio tracks following Tavus example exactly
  useEffect(() => {
    Object.entries(remoteParticipants).forEach(([id, p]: [string, any]) => {
      // Video
      const videoEl = document.getElementById(`remote-video-${id}`) as HTMLVideoElement;
      if (videoEl && p.tracks?.video && p.tracks.video.state === 'playable' && p.tracks.video.persistentTrack) {
        videoEl.srcObject = new MediaStream([p.tracks.video.persistentTrack]);
        console.log('✅ Video attached for participant:', id);
      }
      
      // Audio
      const audioEl = document.getElementById(`remote-audio-${id}`) as HTMLAudioElement;
      if (audioEl && p.tracks?.audio && p.tracks.audio.state === 'playable' && p.tracks.audio.persistentTrack) {
        audioEl.srcObject = new MediaStream([p.tracks.audio.persistentTrack]);
        console.log('✅ Audio attached for participant:', id);
      }
    });
  }, [remoteParticipants]);

  // Daily.js setup following Tavus pattern exactly
  useEffect(() => {
    if (!conversationUrl) return;

    console.log('🚀 Setting up Daily.js with conversation URL:', conversationUrl);
    
    // Get or create singleton call object
    const call = getOrCreateCallObject();
    callRef.current = call;

    // Join meeting
    call.join({ url: conversationUrl })
      .then(() => {
        console.log('✅ Successfully joined Daily call');
        setCallState('joined');
      })
      .catch((error: any) => {
        console.error('❌ Failed to join Daily call:', error);
        setCallState('error');
      });

    // Handle remote participants exactly as in Tavus docs
    call.on('participant-joined', (event: any) => {
      console.log('👤 Participant joined:', event);
      updateRemoteParticipants();
      if (event.participant.user_name !== 'local') {
        setReplicaState('listening');
      }
    });

    call.on('participant-updated', (event: any) => {
      console.log('🔄 Participant updated:', event);
      updateRemoteParticipants();
    });

    call.on('participant-left', (event: any) => {
      console.log('👋 Participant left:', event);
      updateRemoteParticipants();
    });

    call.on('call-state-changed', (event: any) => {
      console.log('📞 Call state changed:', event.state);
      setCallState(event.state);
    });

    call.on('track-started', (event: any) => {
      console.log('🎥 Track started:', event);
      updateRemoteParticipants();
    });

    call.on('track-stopped', (event: any) => {
      console.log('⏹️ Track stopped:', event);
      updateRemoteParticipants();
    });

    call.on('error', (event: any) => {
      console.error('❌ Daily error:', event);
    });

    // Handle app messages for tool calls
    call.on('app-message', (event: any) => {
      console.log('📨 App message received:', event);
      const { data } = event;
      
      switch (data.type) {
        case 'conversation-toolcall':
          if (data.tool_call) {
            handleToolCall(data.tool_call);
          }
          break;
          
        case 'conversation-utterance':
          if (data.utterance) {
            setTranscript(prev => prev + '\n' + data.utterance.text);
          }
          break;
          
        case 'conversation-replica-start-stop-speaking-event':
          setReplicaState(data.is_speaking ? 'speaking' : 'listening');
          break;
      }
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Daily call');
      call.leave().catch(console.error);
    };
  }, [conversationUrl]);

  const joinRoom = async () => {
    setIsLoading(true);
    try {
      console.log('🎬 Creating Tavus conversation...');
      
      // Create Tavus conversation
      const session = await createShoppingSession(
        product.category,
        product.name,
        'Guest'
      );
      
      console.log('✅ Created session:', session);
      setConversationUrl(session.conversation_url);
      
    } catch (error) {
      console.error('❌ Error creating session:', error);
      alert('Failed to start shopping session. Please check your API keys and try again.');
    }
    setIsLoading(false);
  };

  const handleClose = async () => {
    if (callRef.current) {
      try {
        await callRef.current.leave();
      } catch (error) {
        console.error('Error leaving call:', error);
      }
    }
    
    // Clean up any remaining audio/video elements
    const audioElements = document.querySelectorAll('audio[id^="remote-audio-"]');
    audioElements.forEach(audio => audio.remove());
    
    onClose();
  };

  // Audio/Video controls
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

  if (!conversationUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-md w-full text-center border border-purple-500/30">
          <div className="mb-6">
            <img 
              src={product.thumbnail} 
              alt={product.name}
              className="w-32 h-32 object-cover rounded-xl mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
            <p className="text-gray-300">{product.description}</p>
          </div>

          <button
            onClick={joinRoom}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Connecting to Aria...</span>
              </div>
            ) : (
              'Start Live Demo with Aria'
            )}
          </button>

          <button
            onClick={onClose}
            className="mt-4 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[90vh] bg-gray-900 rounded-2xl overflow-hidden flex border border-purple-500/30">
        {/* AI Video Section */}
        <div className="w-1/2 relative bg-gradient-to-br from-purple-900/50 to-blue-900/50">
          {/* Video Container following Tavus recommendations */}
          <div 
            ref={videoContainerRef}
            className="w-full h-full relative bg-gray-800 flex items-center justify-center"
          >
            {/* Remote participants video/audio elements following Tavus pattern exactly */}
            {Object.entries(remoteParticipants).map(([id, p]: [string, any]) => (
              <div key={id} className="w-full h-full relative">
                <video
                  id={`remote-video-${id}`}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <audio 
                  id={`remote-audio-${id}`} 
                  autoPlay 
                  playsInline 
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
                  {p.user_name || `Participant ${id.slice(-4)}`}
                </div>
              </div>
            ))}
            
            {/* Loading/Connection State */}
            {(callState !== 'joined' || Object.keys(remoteParticipants).length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 z-10">
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg">
                    {callState === 'joining' ? 'Joining conversation...' : 
                     callState === 'joined' ? 'Waiting for Aria...' : 
                     callState === 'error' ? 'Connection failed' :
                     'Connecting to Aria...'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">Call State: {callState}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Remote Participants: {Object.keys(remoteParticipants).length}
                  </p>
                  {callState === 'error' && (
                    <button
                      onClick={handleClose}
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Close and Try Again
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Replica Status Indicator */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
              <div className={`w-3 h-3 rounded-full ${
                replicaState === 'speaking' ? 'bg-green-400 animate-pulse' :
                replicaState === 'listening' ? 'bg-blue-400' : 'bg-gray-400'
              }`}></div>
              <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                {replicaState === 'speaking' ? 'Aria is speaking' :
                 replicaState === 'listening' ? 'Aria is listening' : 'Connecting...'}
              </span>
            </div>

            {/* Live Stats */}
            <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-2 backdrop-blur-sm z-20">
              <div className="flex items-center space-x-3 text-white text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{viewerCount}</span>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3 backdrop-blur-sm z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleMute}
                    className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'} text-white hover:scale-105 transition-all`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-full ${!isVideoEnabled ? 'bg-red-500' : 'bg-gray-600'} text-white hover:scale-105 transition-all`}
                  >
                    {!isVideoEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-white text-sm">
                  Shopping with Aria
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dynamic Product Showcase */}
        <div className="w-1/2 bg-gray-800 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {spotlightProduct ? (
              <div className="animate-slideIn">
                <div className="relative">
                  {show360 === spotlightProduct.id ? (
                    <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <RotateCcw className="w-12 h-12 mx-auto mb-2 animate-spin" />
                        <p>360° Interactive View</p>
                        <button 
                          onClick={() => setShow360(false)}
                          className="mt-2 text-sm underline"
                        >
                          Exit 360° View
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={spotlightProduct.image || spotlightProduct.thumbnail} 
                        alt={spotlightProduct.name}
                        className="w-full rounded-lg shadow-2xl"
                      />
                      <button
                        onClick={() => setShow360(spotlightProduct.id)}
                        className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  
                  {activeOffer && activeOffer.productId === spotlightProduct.id && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full animate-bounce shadow-lg">
                      {activeOffer.type === 'discount' && `${activeOffer.discount}% OFF!`}
                      {activeOffer.type === 'limited_time' && 'LIMITED TIME!'}
                      {activeOffer.type === 'exclusive' && 'EXCLUSIVE DEAL!'}
                    </div>
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-white mt-4">{spotlightProduct.name}</h2>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                  ${spotlightProduct.price}
                </p>
                
                {spotlightProduct.highlightFeatures && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold text-white">Key Features:</h3>
                    {spotlightProduct.highlightFeatures.map((feature: string, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center space-x-2 animate-fadeIn" 
                        style={{animationDelay: `${idx * 0.1}s`}}
                      >
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  <div className="text-6xl mb-4">🛍️</div>
                  <p>Products will appear here as Aria demonstrates them</p>
                </div>
              </div>
            )}
            
            {/* Comparison View */}
            {comparisonProducts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-4">Product Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  {comparisonProducts.map((item) => (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-4 animate-slideIn">
                      <img src={item.thumbnail} alt={item.name} className="w-full h-32 object-cover rounded" />
                      <h4 className="text-white font-semibold mt-2">{item.name}</h4>
                      <p className="text-purple-400 font-bold">${item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Transcript */}
            {transcript && (
              <div className="mt-6 bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Live Transcript</h3>
                <div className="text-gray-300 text-sm max-h-32 overflow-y-auto">
                  {transcript.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-700">
            <button 
              onClick={() => addToCart(spotlightProduct?.id || product.id, 1)}
              className={`w-full py-4 rounded-lg text-white font-bold text-lg transform transition-all duration-300 ${
                cartAnimation 
                  ? 'bg-green-500 scale-110 animate-pulse' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105'
              }`}
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
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <span className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{viewerCount} watching</span>
              </span>
              <span className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>89% love this</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ShoppingRoom;