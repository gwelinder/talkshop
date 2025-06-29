import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface MagicCartAnimationProps {
  isActive: boolean;
  productImage: string;
  productName: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

const MagicCartAnimation: React.FC<MagicCartAnimationProps> = ({
  isActive,
  productImage,
  productName,
  startPosition,
  endPosition,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      // Auto-complete after animation duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Flying Product Image */}
          <motion.div
            initial={{
              x: startPosition.x,
              y: startPosition.y,
              scale: 1,
              opacity: 1,
              rotate: 0
            }}
            animate={{
              x: endPosition.x,
              y: endPosition.y,
              scale: 0.3,
              opacity: 0.8,
              rotate: 360
            }}
            exit={{
              opacity: 0,
              scale: 0
            }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth flight
              rotate: { duration: 1.2, ease: "linear" }
            }}
            className="fixed z-50 pointer-events-none"
            style={{
              width: '80px',
              height: '80px'
            }}
          >
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover rounded-lg shadow-2xl border-2 border-brand-400"
            />
            
            {/* Magical Trail Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-brand-400 to-purple-400 rounded-lg opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Sparkle Trail */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="fixed w-2 h-2 bg-brand-400 rounded-full z-40 pointer-events-none"
              initial={{
                x: startPosition.x + 40,
                y: startPosition.y + 40,
                opacity: 0,
                scale: 0
              }}
              animate={{
                x: startPosition.x + 40 + (endPosition.x - startPosition.x) * (i / 8),
                y: startPosition.y + 40 + (endPosition.y - startPosition.y) * (i / 8) + Math.sin(i) * 20,
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
};

export default MagicCartAnimation;