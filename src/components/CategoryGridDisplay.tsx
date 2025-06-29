import React from 'react';
import { Shirt, Gem, Smartphone, Home, Sparkles } from 'lucide-react';

interface CategoryGridDisplayProps {
  onCategorySelect?: (category: string) => void;
}

const CategoryGridDisplay: React.FC<CategoryGridDisplayProps> = ({ onCategorySelect }) => {
  const categories = [
    {
      name: "Electronics",
      key: "electronics",
      icon: Smartphone,
      gradient: "from-blue-500 to-purple-600",
      description: "Latest tech innovations"
    },
    {
      name: "Jewelry",
      key: "jewelery",
      icon: Gem,
      gradient: "from-purple-500 to-pink-600",
      description: "Exquisite precious pieces"
    },
    {
      name: "Men's Fashion",
      key: "men's clothing",
      icon: Shirt,
      gradient: "from-gray-600 to-blue-600",
      description: "Sophisticated menswear"
    },
    {
      name: "Women's Fashion",
      key: "women's clothing",
      icon: Sparkles,
      gradient: "from-pink-500 to-rose-600",
      description: "Elegant women's styles"
    }
  ];

  return (
    <div className="animate-fade-in">
      <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        Explore Our Curated Collections
      </h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div
              key={category.key}
              onClick={() => onCategorySelect?.(category.key)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-br ${category.gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 backdrop-blur-sm`}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-8">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Each collection is carefully curated with premium quality and timeless style
        </p>
      </div>
    </div>
  );
};

export default CategoryGridDisplay;