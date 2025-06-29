import React, { useState } from 'react';
import { ShoppingBag, Settings, User, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  cartItemCount: number;
  onShowCart: () => void;
  onShowSettings: () => void;
  cartJiggle?: boolean;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onShowCart, onShowSettings, cartJiggle = false }) => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
          {/* Logo - Compact */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm sm:text-base lg:text-xl">T</span>
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
              TalkShop
            </span>
          </div>

          {/* Actions - Compact */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Settings */}
            <button 
              onClick={onShowSettings}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Profile */}
            <button 
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Profile"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Magic Cart - Compact */}
            <motion.button 
              onClick={onShowCart}
              data-cart-icon
              className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:scale-105"
              aria-label={`Shopping cart with ${cartItemCount} items`}
              animate={cartJiggle ? {
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
            >
              {/* Magical Glow Effect */}
              {cartJiggle && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-brand-400 to-purple-400 rounded-lg opacity-30 blur-sm"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              
              {cartItemCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30 
                  }}
                  key={cartItemCount}
                >
                  <span className="text-xs">{cartItemCount}</span>
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;