import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, User, Wand2, Play, Edit3, LogIn } from 'lucide-react';
import HostCustomizer from './HostCustomizer';
import GoogleSignInButton from './GoogleSignInButton';
import AuthCallback from './AuthCallback';
import { getCurrentUser, onAuthStateChange, AuthUser } from '../services/authService';

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

interface HostSelectorProps {
  onHostSelect: (host: Host) => void;
  selectedHost?: Host | null;
  onStartConversation?: () => void;
  isConnecting?: boolean;
}

const HostSelector: React.FC<HostSelectorProps> = ({ 
  onHostSelect, 
  selectedHost, 
  onStartConversation,
  isConnecting = false 
}) => {
  const [hoveredHost, setHoveredHost] = useState<string | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizingHost, setCustomizingHost] = useState<Host | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthCallback, setShowAuthCallback] = useState(false);
  const [pendingHost, setPendingHost] = useState<Host | null>(null);

  // Fashion-focused AI hosts
  const fashionHosts: Host[] = [
    {
      id: 'aria-luxury-stylist',
      name: 'Aria',
      replicaId: 'r1a667ea75',
      description: 'Luxury fashion curator & style expert',
      specialty: 'High-End Fashion',
      personality: 'Sophisticated, elegant, with impeccable taste for luxury fashion and timeless style',
      image: '/r1a667ea75.png'
    },
    {
      id: 'sophia-lifestyle-stylist',
      name: 'Sophia',
      replicaId: 'r1dbdb02417a',
      description: 'Lifestyle fashion consultant',
      specialty: 'Everyday Style',
      personality: 'Warm, approachable, specializing in versatile pieces for modern lifestyles',
      image: '/r1dbdb02417a.png'
    },
    {
      id: 'elena-professional-stylist',
      name: 'Elena',
      replicaId: 'r46edb1c4300',
      description: 'Professional wardrobe specialist',
      specialty: 'Business Fashion',
      personality: 'Confident, polished, expert in professional and career-focused styling',
      image: '/r46edb1c4300.png'
    },
    {
      id: 'maya-contemporary-stylist',
      name: 'Maya',
      replicaId: 'r320e29763cf',
      description: 'Contemporary fashion trendsetter',
      specialty: 'Trend-Forward',
      personality: 'Creative, vibrant, always ahead of the latest fashion trends and street style',
      image: '/r320e29763cf.png'
    }
  ];

  const [hosts, setHosts] = useState<Host[]>(fashionHosts);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setAuthUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setAuthUser(user);
      setAuthLoading(false);
      
      // If user just signed in and we have a pending host, proceed
      if (user && pendingHost) {
        onHostSelect(pendingHost);
        setPendingHost(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [pendingHost, onHostSelect]);

  // Handle auth callback from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'callback') {
      setShowAuthCallback(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleHostSelection = (host: Host) => {
    onHostSelect(host);
  };

  const handleCustomizeHost = (host: Host, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setCustomizingHost(host);
    setShowCustomizer(true);
  };

  const handleSaveCustomization = (customizedHost: Host) => {
    setHosts(prev => prev.map(h => h.id === customizedHost.id ? customizedHost : h));
    setShowCustomizer(false);
    setCustomizingHost(null);
    
    if (selectedHost?.id === customizedHost.id) {
      onHostSelect(customizedHost);
    }
  };

  const handleStartConversation = () => {
    if (!authUser && selectedHost) {
      // Store the selected host and trigger auth
      setPendingHost(selectedHost);
      return;
    }

    // User is authenticated, proceed with conversation
    if (onStartConversation) {
      onStartConversation();
    }
  };

  const handleAuthComplete = (user: AuthUser) => {
    setAuthUser(user);
    setShowAuthCallback(false);
    
    // If we have a pending host, select it now
    if (pendingHost) {
      onHostSelect(pendingHost);
      setPendingHost(null);
    }
  };

  const handleAuthError = (error: string) => {
    console.error('Auth error:', error);
    setShowAuthCallback(false);
    setPendingHost(null);
  };

  // Show auth callback screen
  if (showAuthCallback) {
    return (
      <AuthCallback
        onAuthComplete={handleAuthComplete}
        onAuthError={handleAuthError}
      />
    );
  }

  return (
    <>
      <div className={`w-full h-full flex flex-col px-3 sm:px-4 lg:px-6 ${selectedHost ? 'pb-32' : ''}`}>
        {/* Fashion-focused Hero Section */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
              Choose Your Personal Stylist
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Meet our expert fashion stylists, each with their own specialty and approach to personal style
            </p>
          </motion.div>
        </div>

        {/* Auth Status */}
        {authLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          /* Fashion Stylist Grid */
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
              {hosts.map((host, index) => {
                const isSelected = selectedHost?.id === host.id;
                const isHovered = hoveredHost === host.id;
                const isCustomized = !!host.customPrompt;
                
                return (
                  <motion.div
                    key={host.id}
                    className="relative cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -2 }}
                    onMouseEnter={() => setHoveredHost(host.id)}
                    onMouseLeave={() => setHoveredHost(null)}
                    onClick={() => handleHostSelection(host)}
                  >
                    <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isSelected 
                        ? 'border-brand-400 shadow-brand-200 dark:shadow-brand-500/20 shadow-lg ring-1 ring-brand-500 ring-offset-1 ring-offset-gray-50 dark:ring-offset-gray-900' 
                        : isHovered
                          ? 'border-brand-300 dark:border-brand-600 shadow-md'
                          : 'border-white/20 dark:border-gray-700/20'
                    }`}>
                      {/* Stylist Image */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={host.image}
                          alt={host.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Fashion Badges */}
                        {isCustomized && (
                          <motion.div 
                            className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-purple-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center space-x-1 shadow-lg text-xs font-medium z-30"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Wand2 className="w-2 h-2 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Custom</span>
                          </motion.div>
                        )}
                        
                        {isSelected && (
                          <motion.div
                            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-lg z-30"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                          </motion.div>
                        )}
                        
                        {/* Customize Button */}
                        <motion.button
                          onClick={(e) => handleCustomizeHost(host, e)}
                          className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-300 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-full flex items-center space-x-1 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 text-xs font-medium border border-gray-200 dark:border-gray-600 z-40"
                          style={{ pointerEvents: 'auto' }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden sm:inline">Edit</span>
                        </motion.button>
                      </div>

                      {/* Stylist Info */}
                      <div className="p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">{host.name}</h3>
                          <div className="flex items-center space-x-1 text-brand-500 flex-shrink-0">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs font-medium hidden sm:inline">Stylist</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                          {host.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                            {host.specialty}
                          </span>
                          
                          {isSelected ? (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span className="hidden sm:inline">Selected</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500 hidden lg:inline">
                              Tap to select
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer for Selected Stylist */}
      <AnimatePresence>
        {selectedHost && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
              <div className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-brand-200 dark:border-brand-700">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-brand-300 dark:border-brand-600 relative flex-shrink-0">
                      <img
                        src={selectedHost.image}
                        alt={selectedHost.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedHost.customPrompt && (
                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <Wand2 className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {selectedHost.name} is ready to style you
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-1">
                        {selectedHost.description} • {selectedHost.specialty}
                      </p>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" />
                        <span className="text-brand-700 dark:text-brand-300 font-medium text-xs sm:text-sm lg:text-base truncate">
                          {selectedHost.personality}
                        </span>
                        {selectedHost.customPrompt && (
                          <span className="text-purple-600 dark:text-purple-400 text-xs bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full flex-shrink-0">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3 w-full sm:w-auto">
                    <motion.button
                      onClick={(e) => handleCustomizeHost(selectedHost, e)}
                      className="w-full sm:w-auto bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600 text-sm sm:text-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Customize</span>
                    </motion.button>
                    
                    {!authUser ? (
                      <GoogleSignInButton
                        onSignIn={() => setShowAuthCallback(true)}
                        size="md"
                        variant="primary"
                      />
                    ) : (
                      <motion.button
                        onClick={handleStartConversation}
                        disabled={isConnecting}
                        className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transform transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-0 sm:min-w-[140px] lg:min-w-[160px] text-sm sm:text-base"
                        whileHover={!isConnecting ? { scale: 1.02 } : {}}
                        whileTap={!isConnecting ? { scale: 0.98 } : {}}
                      >
                        {isConnecting ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Start Styling</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Host Customizer Modal */}
      <AnimatePresence>
        {showCustomizer && customizingHost && (
          <HostCustomizer
            host={customizingHost}
            onSave={handleSaveCustomization}
            onClose={() => {
              setShowCustomizer(false);
              setCustomizingHost(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HostSelector;