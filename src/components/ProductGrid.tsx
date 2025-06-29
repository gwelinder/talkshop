import React from 'react';
import { Star, Users, Zap, ShoppingCart } from 'lucide-react';
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
  viewers?: number;
  features?: string[];
}

interface ProductGridProps {
  products: Product[];
  onJoinRoom: (product: Product) => void;
  title?: string;
  loading?: boolean;
  onProductHover?: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onJoinRoom, 
  title = "Products", 
  loading = false,
  onProductHover 
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
        {products.map((product) => {
          // Safely handle product data with fallbacks
          const productName = product.name || product.title || 'Product';
          const productImage = product.thumbnail || product.image || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?w=400';
          const productRating = product.rating || { rate: 4.5, count: 100 };
          const productViewers = product.viewers || Math.floor(Math.random() * 50) + 10;
          const productFeatures = product.features || ['High quality', 'Great value'];
          
          return (
            <div 
              key={product.id}
              className="group bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 dark:border-gray-700/20 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/10"
              onMouseEnter={() => onProductHover?.(product.id)}
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={productImage} 
                  alt={productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Live Indicator */}
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Available</span>
                </div>

                {/* Viewers Count */}
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1 backdrop-blur-sm">
                  <Users className="w-3 h-3" />
                  <span>{productViewers}</span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button 
                    onClick={() => onJoinRoom(product)}
                    className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    aria-label={`Quick add ${productName} to cart`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Quick Add</span>
                  </button>
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

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                    ${product.price}
                  </span>
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-semibold">AI Ready</span>
                  </div>
                </div>

                {/* Quick Features */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {productFeatures.slice(0, 2).map((feature, idx) => (
                    <span 
                      key={idx}
                      className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs px-2 py-1 rounded-full border border-brand-200 dark:border-brand-700"
                    >
                      {feature}
                    </span>
                  ))}
                  {productFeatures.length > 2 && (
                    <span className="text-gray-500 dark:text-gray-400 text-xs px-2 py-1">
                      +{productFeatures.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductGrid;