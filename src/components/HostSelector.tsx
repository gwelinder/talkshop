import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, User, Settings, Wand2, ArrowRight, Edit3, Play } from 'lucide-react';
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

  const handleCustomizeHost = (host: Host) => {
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
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Fixed Hero Section - Reduced padding and better text sizing */}
        <div className="text-center mb-4 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3 leading-tight">
              Choose Your AI Shopping Curator
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg max-w-4xl mx-auto leading-relaxed px-4">
              Meet our world-class AI curators, each with their unique expertise and style. 
              Customize their personality to create your perfect shopping companion.
            </p>
          </motion.div>
        </div>

        {/* Host Grid - Fixed Heights and Better Responsive Layout */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 flex-shrink-0">
            {hosts.map((host, index) => {
              const isSelected = selectedHost?.id === host.id;
              const isHovered = hoveredHost === host.id;
              const isCustomized = !!host.customPrompt;
              
              return (
                <motion.div
                  key={host.id}
                  className={`relative cursor-pointer group h-full ${
                    isSelected ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-gray-50 dark:ring-offset-gray-900' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -2 }}
                  onMouseEnter={() => setHoveredHost(host.id)}
                  onMouseLeave={() => setHoveredHost(null)}
                  onClick={() => onHostSelect(host)}
                >
                  <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-lg overflow-hidden border transition-all duration-300 h-full flex flex-col ${
                    isSelected 
                      ? 'border-brand-400 shadow-brand-200 dark:shadow-brand-500/20 shadow-lg' 
                      : isHovered
                        ? 'border-brand-300 dark:border-brand-600 shadow-md'
                        : 'border-white/20 dark:border-gray-700/20'
                  }`}>
                    {/* Host Image - Fixed aspect ratio */}
                    <div className="relative aspect-[3/4] overflow-hidden flex-shrink-0">
                      <img
                        src={host.image}
                        alt={host.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Customization Indicator */}
                      {isCustomized && (
                        <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <Wand2 className="w-2 h-2 text-white" />
                        </div>
                      )}
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-2.5 h-2.5 text-white" />
                        </motion.div>
                      )}
                      
                      {/* Customize Button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomizeHost(host);
                        }}
                        className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white dark:hover:bg-gray-800"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit3 className="w-2.5 h-2.5 text-gray-700 dark:text-gray-300" />
                      </motion.button>
                      
                      {/* Hover Overlay with Better Info */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <div className="absolute bottom-2 left-2 right-6 text-white">
                          <div className="flex items-center space-x-1 mb-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span className="text-xs font-medium">{host.specialty}</span>
                          </div>
                          <p className="text-xs opacity-90 line-clamp-2">{host.personality}</p>
                        </div>
                      </div>
                    </div>

                    {/* Host Info - Fixed height */}
                    <div className="p-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{host.name}</h3>
                          <div className="flex items-center space-x-1 text-brand-500 flex-shrink-0">
                            <User className="w-2.5 h-2.5" />
                            <span className="text-xs font-medium">AI</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-2">
                          {host.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded-full truncate">
                          {host.specialty}
                        </span>
                        
                        {isSelected ? (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Select
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Host Preview & Primary CTA - Better responsive layout */}
          {selectedHost && (
            <motion.div
              className="mt-auto flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-brand-200 dark:border-brand-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-300 dark:border-brand-600 relative flex-shrink-0">
                      <img
                        src={selectedHost.image}
                        alt={selectedHost.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedHost.customPrompt && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <Wand2 className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {selectedHost.name} is ready to assist you
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1 line-clamp-1">
                        {selectedHost.description} • {selectedHost.specialty} specialist
                      </p>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Sparkles className="w-3 h-3 text-brand-500 flex-shrink-0" />
                        <span className="text-brand-700 dark:text-brand-300 text-sm font-medium truncate">
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
                  
                  {/* Primary CTA - Responsive sizing */}
                  <motion.button
                    onClick={onStartConversation}
                    disabled={isConnecting}
                    className="flex-shrink-0 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg transform transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    whileHover={!isConnecting ? { scale: 1.02 } : {}}
                    whileTap={!isConnecting ? { scale: 0.98 } : {}}
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Connecting to {selectedHost.name}...</span>
                        <span className="sm:hidden">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span className="hidden sm:inline">Start Shopping with {selectedHost.name}</span>
                        <span className="sm:hidden">Start Shopping</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
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