import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, User } from 'lucide-react';

interface Host {
  id: string;
  name: string;
  replicaId: string;
  description: string;
  specialty: string;
  personality: string;
  image: string;
}

interface HostSelectorProps {
  onHostSelect: (host: Host) => void;
  selectedHost?: Host | null;
}

const HostSelector: React.FC<HostSelectorProps> = ({ onHostSelect, selectedHost }) => {
  const [hoveredHost, setHoveredHost] = useState<string | null>(null);

  const hosts: Host[] = [
    {
      id: 'aria-classic',
      name: 'Aria',
      replicaId: 'r1a667ea75',
      description: 'Your sophisticated luxury curator',
      specialty: 'High-end fashion & luxury goods',
      personality: 'Elegant, refined, with impeccable taste',
      image: '/r1a667ea75.png'
    },
    {
      id: 'marcus-tech',
      name: 'Marcus',
      replicaId: 'rd9a4f778a54',
      description: 'Tech innovation specialist',
      specialty: 'Electronics & cutting-edge gadgets',
      personality: 'Sharp, analytical, future-focused',
      image: '/rd9a4f778a54.png'
    },
    {
      id: 'sophia-lifestyle',
      name: 'Sophia',
      replicaId: 'r1dbdb02417a',
      description: 'Lifestyle & wellness expert',
      specialty: 'Home, beauty & wellness products',
      personality: 'Warm, nurturing, holistically minded',
      image: '/r1dbdb02417a.png'
    },
    {
      id: 'elena-professional',
      name: 'Elena',
      replicaId: 'r46edb1c4300',
      description: 'Professional style consultant',
      specialty: 'Business attire & professional wear',
      personality: 'Confident, polished, success-oriented',
      image: '/r46edb1c4300.png'
    },
    {
      id: 'maya-contemporary',
      name: 'Maya',
      replicaId: 'r320e29763cf',
      description: 'Contemporary fashion maven',
      specialty: 'Trendy fashion & lifestyle accessories',
      personality: 'Creative, vibrant, trend-setting',
      image: '/r320e29763cf.png'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
          Choose Your Personal Shopping Curator
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Each curator brings their unique expertise and style to transform your shopping experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {hosts.map((host, index) => {
          const isSelected = selectedHost?.id === host.id;
          const isHovered = hoveredHost === host.id;
          
          return (
            <motion.div
              key={host.id}
              className={`relative cursor-pointer group ${
                isSelected ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              onMouseEnter={() => setHoveredHost(host.id)}
              onMouseLeave={() => setHoveredHost(null)}
              onClick={() => onHostSelect(host)}
            >
              <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl overflow-hidden border transition-all duration-300 ${
                isSelected 
                  ? 'border-brand-400 shadow-brand-200 dark:shadow-brand-500/20 shadow-lg' 
                  : isHovered
                    ? 'border-brand-300 dark:border-brand-600 shadow-lg'
                    : 'border-white/20 dark:border-gray-700/20'
              }`}>
                {/* Host Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={host.image}
                    alt={host.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute top-4 right-4 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">{host.specialty}</span>
                      </div>
                      <p className="text-xs opacity-90">{host.personality}</p>
                    </div>
                  </div>
                </div>

                {/* Host Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{host.name}</h3>
                    <div className="flex items-center space-x-1 text-brand-500">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-medium">AI</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {host.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded-full">
                      {host.specialty.split(' ')[0]}
                    </span>
                    
                    {isSelected ? (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Selected
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Click to select
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Host Preview */}
      {selectedHost && (
        <motion.div
          className="mt-8 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-brand-200 dark:border-brand-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-300 dark:border-brand-600">
              <img
                src={selectedHost.image}
                alt={selectedHost.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {selectedHost.name} is ready to assist you
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {selectedHost.description} • Specializes in {selectedHost.specialty.toLowerCase()}
              </p>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="text-brand-700 dark:text-brand-300 text-sm font-medium">
                  {selectedHost.personality}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HostSelector;