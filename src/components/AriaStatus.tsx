import React from 'react';
import { Loader2 } from 'lucide-react';

interface AriaStatusProps {
  replicaState: 'connecting' | 'listening' | 'speaking';
  hostName?: string;
}

const AriaStatus: React.FC<AriaStatusProps> = ({ replicaState, hostName = 'Aria' }) => {
  return (
    <div className="flex items-center justify-center space-x-3 py-2">
      {/* Status Indicator */}
      <div className="relative">
        {replicaState === 'speaking' && (
          <div className="flex items-center space-x-1">
            {/* Soundwave Animation */}
            <div className="flex items-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-pulse"
                  style={{
                    height: `${12 + Math.sin(Date.now() / 200 + i) * 8}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
            <div className="ml-2 w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
          </div>
        )}
        
        {replicaState === 'listening' && (
          <div className="relative">
            {/* Pulsing Orb */}
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg shadow-blue-500/30" />
            {/* Ripple Effect */}
            <div className="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 w-6 h-6 bg-purple-400 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
          </div>
        )}
        
        {replicaState === 'connecting' && (
          <div className="flex items-center space-x-2">
            {/* Sleek Loading Spinner */}
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Status Text */}
      <span className="text-sm font-medium text-gray-700">
        {replicaState === 'speaking' && (
          <span className="text-purple-600 font-semibold">{hostName} is speaking</span>
        )}
        {replicaState === 'listening' && (
          <span className="text-blue-600 font-semibold">{hostName} is listening</span>
        )}
        {replicaState === 'connecting' && (
          <span className="text-gray-500">Connecting to {hostName}...</span>
        )}
      </span>
    </div>
  );
};

export default AriaStatus;