import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { handleAuthCallback, AuthUser } from '../services/authService';

interface AuthCallbackProps {
  onAuthComplete: (user: AuthUser) => void;
  onAuthError: (error: string) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({
  onAuthComplete,
  onAuthError
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    const processAuth = async () => {
      try {
        setStatus('loading');
        setMessage('Verifying your account...');
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = await handleAuthCallback();
        
        if (user) {
          setStatus('success');
          setMessage(user.isNewUser ? 'Welcome to TalkShop!' : 'Welcome back!');
          
          // Another small delay before completing
          setTimeout(() => {
            onAuthComplete(user);
          }, 1500);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Sign-in failed. Please try again.');
        onAuthError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    processAuth();
  }, [onAuthComplete, onAuthError]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20 dark:border-gray-700/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
        >
          {getIcon()}
        </motion.div>

        <motion.h2
          className={`text-2xl font-bold mb-4 ${
            status === 'loading' ? 'text-blue-600 dark:text-blue-400' :
            status === 'success' ? 'text-green-600 dark:text-green-400' :
            'text-red-600 dark:text-red-400'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {status === 'loading' && 'Signing you in...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Oops!'}
        </motion.h2>

        <motion.p
          className="text-gray-600 dark:text-gray-300 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {message}
        </motion.p>

        {status === 'loading' && (
          <motion.div
            className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            className="text-green-600 dark:text-green-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Redirecting to your shopping experience...
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;