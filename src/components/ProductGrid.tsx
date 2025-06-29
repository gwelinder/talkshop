import React from 'react';
import { Star, Users, Zap, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  thumbnail: string;
  rating: { rate: number; count: number; };
  viewers: number;
  features: string[];
}

interface ProductGridProps {
  products: Product[];
  onJoinRoom: (product: Product) => void;
  title?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onJoinRoom, title = "Products" }) => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product.id}
            className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={product.thumbnail} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Live Indicator */}
              <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Available</span>
              </div>

              {/* Viewers Count */}
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{product.viewers}</span>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button 
                  onClick={() => onJoinRoom(product)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Quick Add</span>
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-600 text-sm">{product.rating.rate}</span>
                </div>
              </div>

              <h3 className="text-gray-900 font-semibold text-lg mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <div className="flex items-center space-x-1 text-green-600">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-semibold">AI Ready</span>
                </div>
              </div>

              {/* Quick Features */}
              <div className="mt-3 flex flex-wrap gap-1">
                {product.features.slice(0, 2).map((feature, idx) => (
                  <span 
                    key={idx}
                    className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
                  >
                    {feature}
                  </span>
                ))}
                {product.features.length > 2 && (
                  <span className="text-gray-500 text-xs px-2 py-1">
                    +{product.features.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;