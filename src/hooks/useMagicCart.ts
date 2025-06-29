import { useState, useCallback, useRef } from 'react';

interface CartAnimationState {
  isActive: boolean;
  productImage: string;
  productName: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}

export const useMagicCart = () => {
  const [animationState, setAnimationState] = useState<CartAnimationState>({
    isActive: false,
    productImage: '',
    productName: '',
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 0, y: 0 }
  });

  const triggerMagicCart = useCallback((
    productImage: string,
    productName: string,
    sourceElement: HTMLElement
  ) => {
    // Get source element position
    const sourceRect = sourceElement.getBoundingClientRect();
    const startPosition = {
      x: sourceRect.left + sourceRect.width / 2 - 40, // Center the 80px image
      y: sourceRect.top + sourceRect.height / 2 - 40
    };

    // Get cart icon position (assuming it's in the header)
    const cartIcon = document.querySelector('[data-cart-icon]') as HTMLElement;
    if (!cartIcon) {
      console.warn('Cart icon not found for magic animation');
      return;
    }

    const cartRect = cartIcon.getBoundingClientRect();
    const endPosition = {
      x: cartRect.left + cartRect.width / 2 - 40,
      y: cartRect.top + cartRect.height / 2 - 40
    };

    setAnimationState({
      isActive: true,
      productImage,
      productName,
      startPosition,
      endPosition
    });
  }, []);

  const completeMagicCart = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isActive: false }));
  }, []);

  return {
    animationState,
    triggerMagicCart,
    completeMagicCart
  };
};