import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, Shirt } from 'lucide-react';

interface UserInputProps {
  onMessageSend: (message: string) => void;
  onFocus: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const UserInput: React.FC<UserInputProps> = ({ 
  onMessageSend, 
  onFocus, 
  disabled = false,
  placeholder = "Ask about styles, fashion advice, or describe what you're looking for..."
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasEverFocused, setHasEverFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onMessageSend(message.trim());
      setMessage('');
    }
  };

  const handleFocus = () => {
    if (!hasEverFocused) {
      setHasEverFocused(true);
      onFocus();
    }
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would handle voice recording
    // For now, we'll just toggle the visual state
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-brand-400 dark:focus-within:border-brand-500 focus-within:shadow-brand-500/20">
          {/* Fashion-focused Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={handleFocus}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 px-6 py-4 pr-24 rounded-2xl focus:outline-none text-lg font-medium"
          />
          
          {/* Action Buttons */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleMicClick}
              disabled={disabled}
              className={`p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              <Mic className="w-4 h-4" />
            </button>
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="p-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Fashion Helper Text */}
        <div className="flex items-center justify-center mt-3 text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <Shirt className="w-3 h-3" />
          <span>Ask about styles, outfit ideas, or fashion advice</span>
          <Sparkles className="w-3 h-3" />
        </div>
      </form>
    </div>
  );
};

export default UserInput;