import React from 'react';
import { motion } from 'framer-motion';
import { X, Wand2, Eye } from 'lucide-react';

interface PerceptionNotificationProps {
  type: 'style' | 'object';
  data: any;
  onAction: (action: 'analyze' | 'dismiss') => void;
  onClose: () => void;
}

const PerceptionNotification: React.FC<PerceptionNotificationProps> = ({
  type,
  data,
  onAction,
  onClose
}) => {
  if (!data) return null;

  return (
    <motion.div 
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-brand-200 dark:border-brand-700 p-4 max-w-xs"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          {type === 'style' ? (
            <>
              <Wand2 className="w-4 h-4 mr-1 text-brand-500" />
              Style Detected
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-1 text-blue-500" />
              Object Detected
            </>
          )}
        </h4>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mb-3 text-xs text-gray-600 dark:text-gray-300">
        {type === 'style' ? (
          <>
            <p>I noticed your style has these elements:</p>
            <ul className="mt-1 space-y-1">
              <li>• Color: <span className="font-medium">{data.dominant_color}</span></li>
              <li>• Style: <span className="font-medium">{data.style_category}</span></li>
              {data.clothing_items && (
                <li>• Items: <span className="font-medium">{data.clothing_items.join(', ')}</span></li>
              )}
            </ul>
          </>
        ) : (
          <>
            <p>I noticed this object:</p>
            <ul className="mt-1 space-y-1">
              <li>• Type: <span className="font-medium">{data.object_category}</span></li>
              <li>• Color: <span className="font-medium">{data.dominant_color}</span></li>
              <li>• Description: <span className="font-medium">{data.object_description}</span></li>
            </ul>
          </>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onAction('analyze')}
          className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-xs py-1.5 px-2 rounded"
        >
          {type === 'style' ? 'Show Recommendations' : 'Find Matching Items'}
        </button>
        <button
          onClick={() => onAction('dismiss')}
          className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs py-1.5 px-2 rounded"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
};

export default PerceptionNotification;