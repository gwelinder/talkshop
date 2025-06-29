import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, User, Settings, Wand2, ArrowRight, Edit3, Play, Zap, MessageCircle } from 'lucide-react';
import HostCustomizer from './HostCustomizer';

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

  const defaultHosts: Host[] = [
    {
      id: 'aria-classic',
      name: 'Aria',
      replicaId: 'r1a667ea75',
      description: 'Your sophisticated luxury curator',
      specialty: 'High-end',
      personality: 'Elegant, refined, with impeccable taste',
      image: '/r1a667ea75.png'
    },
    {
      id: 'marcus-tech',
      name: 'Marcus',
      replicaId: 'rd9a4f778a54',
      description: 'Tech innovation specialist',
      specialty: 'Electronics',
      personality: 'Sharp, analytical, future-focused',
      image: '/rd9a4f778a54.png'
    },
    {
      id: 'sophia-lifestyle',
      name: 'Sophia',
      replicaId: 'r1dbdb02417a',
      description: 'Lifestyle & wellness expert',
      specialty: 'Home',
      personality: 'Warm, nurturing, holistically minded',
      image: '/r1dbdb02417a.png'
    },
    {
      id: 'elena-professional',
      name: 'Elena',
      replicaId: 'r46edb1c4300',
      description: 'Professional style consultant',
      specialty: 'Business',
      personality: 'Confident, polished, success-oriented',
      image: '/r46edb1c4300.png'
    },
    {
      id: 'maya-contemporary',
      name: 'Maya',
      replicaId: 'r320e29763cf',
      description: 'Contemporary fashion maven',
      specialty: 'Trendy',
      personality: 'Creative, vibrant, trend-setting',
      image: '/r320e29763cf.png'
    }
  ];

  const [hosts, setHosts] = useState<Host[]>(defaultHosts);

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
    
    // If this was the selected host, update the selection
    if (selectedHost?.id === customizedHost.id) {
      onHostSelect(customizedHost);
    }
  };

  return (
    <>
      <div className="w-full h-full flex flex-col px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Responsive Spacing */}
        <div className="text-center mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3 lg:mb-4 leading-tight">
              Choose Your AI Curator
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              Meet our world-class AI curators. Select one and customize their personality to match your style.
            </p>
          </motion.div>
        </div>

        {/* Host Cards - Responsive Grid */}
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 lg:mb-8">
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
                  onClick={() => onHostSelect(host)}
                >
                  <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-xl lg:rounded-2xl overflow-hidden border transition-all duration-300 ${
                    isSelected 
                      ? 'border-brand-400 shadow-brand-200 dark:shadow-brand-500/20 shadow-lg lg:shadow-xl ring-1 lg:ring-2 ring-brand-500 ring-offset-1 lg:ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900' 
                      : isHovered
                        ? 'border-brand-300 dark:border-brand-600 shadow-md lg:shadow-lg'
                        : 'border-white/20 dark:border-gray-700/20'
                  }`}>
                    {/* Host Image - Responsive Aspect Ratio */}
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden">
                      <img
                        src={host.image}
                        alt={host.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Customization Badge */}
                      {isCustomized && (
                        <motion.div 
                          className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg text-xs font-medium z-30"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Wand2 className="w-2 h-2 sm:w-3 sm:h-3" />
                          <span className="hidden sm:inline">Custom</span>
                        </motion.div>
                      )}
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-lg z-30"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </motion.div>
                      )}
                      
                      {/* Edit Button - Always Visible on Mobile */}
                      <motion.button
                        onClick={(e) => handleCustomizeHost(host, e)}
                        className="absolute bottom-2 right-2 bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-300 px-2 py-1 sm:px-3 sm:py-2 rounded-full flex items-center space-x-1 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 text-xs sm:text-sm font-medium border border-gray-200 dark:border-gray-600 z-40"
                        style={{ pointerEvents: 'auto' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit3 className="w-2 h-2 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </motion.button>
                      
                      {/* Overlay with Info - Desktop Only */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 z-10 hidden sm:block ${
                          isHovered || isSelected ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ pointerEvents: 'none' }}
                      >
                        <div className="absolute bottom-12 left-3 right-3 text-white">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="text-xs lg:text-sm font-medium">{host.specialty}</span>
                          </div>
                          <p className="text-xs lg:text-sm opacity-90 leading-relaxed">
                            {host.personality}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Host Info - Responsive Padding */}
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">{host.name}</h3>
                        <div className="flex items-center space-x-1 text-brand-500">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">AI</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed">
                        {host.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded-full">
                          {host.specialty}
                        </span>
                        
                        {isSelected ? (
                          <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium flex items-center space-x-1">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Selected</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
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

          {/* Selected Host CTA - FIXED: Now appears directly below host grid */}
          {selectedHost && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-brand-200 dark:border-brand-700">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-brand-300 dark:border-brand-600 relative flex-shrink-0">
                      <img
                        src={selectedHost.image}
                        alt={selectedHost.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedHost.customPrompt && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <Wand2 className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {selectedHost.name} is ready
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-2">
                        {selectedHost.description} • {selectedHost.specialty} specialist
                      </p>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" />
                        <span className="text-brand-700 dark:text-brand-300 font-medium text-sm sm:text-base">
                          {selectedHost.personality}
                        </span>
                        {selectedHost.customPrompt && (
                          <span className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                            Customized
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Responsive Button Layout */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    {/* Customize Button - Full width on mobile */}
                    <motion.button
                      onClick={(e) => handleCustomizeHost(selectedHost, e)}
                      className="w-full sm:w-auto bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-3 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600 text-sm sm:text-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Customize</span>
                    </motion.button>
                    
                    {/* Start Shopping Button - Full width on mobile */}
                    <motion.button
                      onClick={onStartConversation}
                      disabled={isConnecting}
                      className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transform transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-0 sm:min-w-[160px] text-sm sm:text-base"
                      whileHover={!isConnecting ? { scale: 1.02 } : {}}
                      whileTap={!isConnecting ? { scale: 0.98 } : {}}
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Shopping</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

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