import React from 'react';
import { Shirt, Gem, ShoppingBag, Crown, Sparkles, Heart } from 'lucide-react';

interface CategoryGridDisplayProps {
  onCategorySelect?: (category: string) => void;
}

const CategoryGridDisplay: React.FC<CategoryGridDisplayProps> = ({ onCategorySelect }) => {
  const fashionCategories = [
    {
      name: "Women's Fashion",
      key: "women's clothing",
      icon: Sparkles,
      gradient: "from-pink-500 to-rose-600",
      description: "Elegant dresses, tops & more"
    },
    {
      name: "Men's Fashion",
      key: "men's clothing",
      icon: Shirt,
      gradient: "from-blue-600 to-indigo-700",
      description: "Sophisticated menswear"
    },
    {
      name: "Accessories",
      key: "accessories",
      icon: Crown,
      gradient: "from-purple-500 to-violet-600",
      description: "Scarves, belts & statement pieces"
    },
    {
      name: "Bags & Purses",
      key: "bags",
      icon: ShoppingBag,
      gradient: "from-amber-500 to-orange-600",
      description: "Handbags, clutches & totes"
    },
    {
      name: "Jewelry",
      key: "jewelry",
      icon: Gem,
      gradient: "from-emerald-500 to-teal-600",
      description: "Necklaces, earrings & rings"
    },
    {
      name: "Footwear",
      key: "footwear",
      icon: Heart,
      gradient: "from-red-500 to-pink-600",
      description: "Shoes, boots & sneakers"
    }
  ];

  return (
    <div className="animate-fade-in">
      <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        Explore Your Style Categories
      </h4>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {fashionCategories.map((category) => {
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
          Each category is curated with premium quality and timeless style in mind
        </p>
      </div>
    </div>
  );
};

export default CategoryGridDisplay;