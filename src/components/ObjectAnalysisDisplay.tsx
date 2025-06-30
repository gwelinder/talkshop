import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Box, Palette, FileText } from 'lucide-react';

interface ObjectAnalysisDisplayProps {
  objectData: {
    dominant_color: string;
    object_category: string;
    object_description: string;
  };
}

const ObjectAnalysisDisplay: React.FC<ObjectAnalysisDisplayProps> = ({ objectData }) => {
  if (!objectData) return null;

  return (
    <motion.div 
      className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
        <Eye className="w-4 h-4" />
        <span>Object Analysis</span>
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-blue-700 dark:text-blue-300 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Description:</span>
            <p className="text-blue-900 dark:text-blue-100 text-sm">{objectData.object_description}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Palette className="w-4 h-4 text-blue-700 dark:text-blue-300 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Color:</span>
            <p className="text-blue-900 dark:text-blue-100 capitalize text-sm">{objectData.dominant_color}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Box className="w-4 h-4 text-blue-700 dark:text-blue-300 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Category:</span>
            <p className="text-blue-900 dark:text-blue-100 capitalize text-sm">{objectData.object_category}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ObjectAnalysisDisplay;