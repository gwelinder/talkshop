import React from 'react';
import { Star, Users, Zap, ShoppingCart, Shirt, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductSkeleton from './ProductSkeleton';

interface Product {
  id: string;
  name?: string;
  title?: string;
  category: string;
  price: number;
  description: string;
  thumbnail?: string;
  image?: string;
  rating?: { rate: number; count: number; };
  features?: string[];
  // Fashion-specific properties
  material?: string;
  color_options?: string[];
  size_options?: string[];
  occasion?: string[];
  style_tags?: string[];
  fit?: string;
}

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void; // Renamed from onJoinRoom
  title?: string;
  loading?: boolean;
  onProductHover?: (productId: string) => void;
  focusedProductId?: string | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onProductSelect, // Renamed from onJoinRoom
  title = "Fashion Collection", 
  loading = false,
  onProductHover,
  focusedProductId
}) => {
  if (loading) {
    return (
      <section className="mb-16">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-12 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-12 text-center">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => {
          // Safely handle product data with fallbacks
          const productName = product.name || product.title || 'Fashion Item';
          const productImage = product.thumbnail || product.image || 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400';
          const productRating = product.rating || { rate: 4.5, count: 100 };
          const productFeatures = product.features || ['High quality', 'Great style'];
          const isFocused = focusedProductId === product.id;
          
          return (
            <motion.div 
              key={product.id}
              data-product-id={product.id}
              className={`group bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-xl overflow-hidden border transition-all duration-500 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/10 ${
                isFocused 
                  ? 'border-brand-400 shadow-brand-200 dark:shadow-brand-500/20 shadow-2xl scale-105 z-10 ring-2 ring-brand-500 ring-opacity-50' 
                  : 'border-white/20 dark:border-gray-700/20 hover:border-brand-300 dark:hover:border-brand-600'
              }`}
              onMouseEnter={() => onProductHover?.(product.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isFocused ? 1.05 : 1,
                zIndex: isFocused ? 10 : 1
              }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5,
                scale: { duration: 0.3 },
                zIndex: { duration: 0 }
              }}
              whileHover={{ y: -4 }}
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={productImage} 
                  alt={productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Fashion Tag */}
                <div className="absolute top-3 left-3 bg-brand-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <Shirt className="w-3 h-3" />
                  <span>{(product.category || '').split(' ')[0]}</span>
                </div>

                {/* Focus Indicator */}
                {isFocused && (
                  <motion.div
                    className="absolute inset-0 bg-brand-500/20 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="bg-brand-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                      ✨ Featured Piece
                    </div>
                  </motion.div>
                )}

                {/* Hover Overlay with Magic Button */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.button 
                    onClick={() => onProductSelect(product)} // Updated prop name
                    className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                    aria-label={`Quick add ${productName} to cart`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Quick Add</span>
                  </motion.button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wide">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {productRating.rate?.toFixed(1) || '4.5'}
                    </span>
                  </div>
                </div>

                <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2 line-clamp-2">
                  {productName}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Fashion-specific details */}
                {product.material && (
                  <div className="mb-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Material: </span>
                    <span className="text-gray-900 dark:text-gray-100">{product.material}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                    ${product.price}
                  </span>
                  <div className="flex items-center space-x-1 text-brand-600 dark:text-brand-400">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs font-semibold">Style Pick</span>
                  </div>
                </div>

                {/* Fashion Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {product.style_tags ? (
                    product.style_tags.slice(0, 2).map((tag, idx) => (
                      <span 
                        key={idx}
                        className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs px-2 py-1 rounded-full border border-brand-200 dark:border-brand-700"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    productFeatures.slice(0, 2).map((feature, idx) => (
                      <span 
                        key={idx}
                        className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs px-2 py-1 rounded-full border border-brand-200 dark:border-brand-700"
                      >
                        {feature}
                      </span>
                    ))
                  )}
                </div>

                {/* Item Number for Voice Commands */}
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    Item {index + 1}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductGrid;