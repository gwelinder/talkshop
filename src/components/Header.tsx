import React, { useState } from 'react';
import { ShoppingBag, Settings, User, Moon, Sun, LogOut, FileText, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthUser, signOut } from '../services/authService';

interface HeaderProps {
  cartItemCount: number;
  onShowCart: () => void;
  onShowSettings: () => void;
  cartJiggle?: boolean;
  user?: AuthUser | null;
  onShowPrivacy?: () => void;
  onShowTerms?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cartItemCount, 
  onShowCart, 
  onShowSettings, 
  cartJiggle = false,
  user,
  onShowPrivacy,
  onShowTerms
}) => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm relative"> {/* Added relative positioning */}
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
          {/* Logo - Updated with TalkShop logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="/logotalskhop.png" 
              alt="TalkShop" 
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain"
            />
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

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label="User menu"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span className="hidden sm:inline text-sm font-medium truncate max-w-20">
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    {/* Legal Links */}
                    {onShowPrivacy && (
                      <button
                        onClick={() => {
                          onShowPrivacy();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Privacy Policy</span>
                      </button>
                    )}
                    
                    {onShowTerms && (
                      <button
                        onClick={() => {
                          onShowTerms();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Terms of Service</span>
                      </button>
                    )}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <button 
                className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Profile"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

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

        {/* Bolt Badge - positioned absolutely */}
        <a 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50" 
            aria-label="Built with Bolt.new"
        >
            <img 
                src="/white_circle_360x360.png" 
                alt="Built with Bolt.new" 
                className="w-8 h-8 sm:w-10 sm:h-10" 
            />
        </a>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;