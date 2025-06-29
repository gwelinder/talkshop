import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 dark:border-gray-700/20 animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200/50 dark:bg-gray-700/50 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded w-1/3" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full" />
          <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-2/3" />
        </div>
        
        {/* Description */}
        <div className="space-y-1">
          <div className="h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full" />
          <div className="h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded w-3/4" />
        </div>
        
        {/* Price and rating */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200/50 dark:bg-gray-700/50 rounded w-16" />
          <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-12" />
        </div>
        
        {/* Features */}
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200/50 dark:bg-gray-700/50 rounded-full w-16" />
          <div className="h-6 bg-gray-200/50 dark:bg-gray-700/50 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;