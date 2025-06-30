import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, Shirt, Palette, Sparkles } from 'lucide-react';

interface StyleAnalysisDisplayProps {
  styleData: {
    dominant_color: string;
    style_category: string;
    clothing_items?: string[];
  };
}

const StyleAnalysisDisplay: React.FC<StyleAnalysisDisplayProps> = ({ styleData }) => {
  if (!styleData) return null;

  return (
    <motion.div 
      className="mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center space-x-2">
        <Wand2 className="w-4 h-4" />
        <span>Style Analysis</span>
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-start space-x-2">
          <Palette className="w-4 h-4 text-purple-700 dark:text-purple-300 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">Color:</span>
            <p className="text-purple-900 dark:text-purple-100 capitalize text-sm">{styleData.dominant_color || 'Not detected'}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-purple-700 dark:text-purple-300 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">Style:</span>
            <p className="text-purple-900 dark:text-purple-100 capitalize text-sm">{styleData.style_category || 'Not detected'}</p>
          </div>
        </div>
        
        {styleData.clothing_items && styleData.clothing_items.length > 0 && (
          <div className="flex items-start space-x-2">
            <Shirt className="w-4 h-4 text-purple-700 dark:text-purple-300 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">Items:</span>
              <p className="text-purple-900 dark:text-purple-100 text-sm">
                {styleData.clothing_items.slice(0, 2).join(', ')}
                {styleData.clothing_items.length > 2 && '...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StyleAnalysisDisplay;