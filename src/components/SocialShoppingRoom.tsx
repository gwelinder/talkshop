import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, MessageCircle, Share2, ThumbsUp, Star } from 'lucide-react';

interface SocialShoppingRoomProps {
  productId: string;
  onJoinRoom: () => void;
  onLeaveRoom: () => void;
}

interface Viewer {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
}

interface Reaction {
  id: string;
  userId: string;
  type: 'heart' | 'thumbs_up' | 'star' | 'fire';
  timestamp: number;
}

const SocialShoppingRoom: React.FC<SocialShoppingRoomProps> = ({
  productId,
  onJoinRoom,
  onLeaveRoom
}) => {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [liveComments, setLiveComments] = useState<string[]>([]);

  // Simulate live viewers joining/leaving
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const newViewers = [...prev];
        
        // Randomly add/remove viewers
        if (Math.random() > 0.7 && newViewers.length < 12) {
          newViewers.push({
            id: `viewer_${Date.now()}`,
            name: `User${Math.floor(Math.random() * 1000)}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
            isActive: true
          });
        } else if (Math.random() > 0.8 && newViewers.length > 3) {
          newViewers.pop();
        }
        
        return newViewers;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate live reactions
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const reactionTypes: Array<'heart' | 'thumbs_up' | 'star' | 'fire'> = ['heart', 'thumbs_up', 'star', 'fire'];
        const newReaction: Reaction = {
          id: `reaction_${Date.now()}`,
          userId: `user_${Math.floor(Math.random() * 100)}`,
          type: reactionTypes[Math.floor(Math.random() * reactionTypes.length)],
          timestamp: Date.now()
        };
        
        setReactions(prev => [...prev.slice(-10), newReaction]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simulate live comments
  useEffect(() => {
    const comments = [
      "This looks amazing! 😍",
      "I need this in my wardrobe",
      "What's the material?",
      "Perfect for summer!",
      "Adding to cart now!",
      "Love the color",
      "How's the fit?",
      "Gorgeous piece! ✨"
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        setLiveComments(prev => [...prev.slice(-5), randomComment]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = () => {
    setIsJoined(true);
    onJoinRoom();
  };

  const handleLeaveRoom = () => {
    setIsJoined(false);
    onLeaveRoom();
  };

  const addReaction = (type: 'heart' | 'thumbs_up' | 'star' | 'fire') => {
    const newReaction: Reaction = {
      id: `my_reaction_${Date.now()}`,
      userId: 'me',
      type,
      timestamp: Date.now()
    };
    setReactions(prev => [...prev, newReaction]);
  };

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'heart': return '❤️';
      case 'thumbs_up': return '👍';
      case 'star': return '⭐';
      case 'fire': return '🔥';
      default: return '👍';
    }
  };

  return (
    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-gray-900 dark:text-gray-100 font-semibold">Live Shopping Session</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">{viewers.length + (isJoined ? 1 : 0)} watching</span>
        </div>
      </div>

      {/* Live Viewers */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Live Viewers</h3>
        <div className="flex flex-wrap gap-2">
          {viewers.slice(0, 8).map((viewer) => (
            <motion.div
              key={viewer.id}
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <img
                src={viewer.avatar}
                alt={viewer.name}
                className="w-8 h-8 rounded-full border-2 border-green-400"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
            </motion.div>
          ))}
          {viewers.length > 8 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
              +{viewers.length - 8}
            </div>
          )}
        </div>
      </div>

      {/* Live Reactions */}
      <div className="mb-6 relative h-20 overflow-hidden">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Live Reactions</h3>
        <div className="absolute inset-0">
          <AnimatePresence>
            {reactions.slice(-6).map((reaction) => (
              <motion.div
                key={reaction.id}
                className="absolute text-2xl"
                initial={{ 
                  x: Math.random() * 200, 
                  y: 60, 
                  opacity: 1, 
                  scale: 0 
                }}
                animate={{ 
                  y: -20, 
                  opacity: 0, 
                  scale: 1 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: "easeOut" }}
              >
                {getReactionEmoji(reaction.type)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Live Comments */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Live Comments</h3>
        <div className="space-y-2 max-h-24 overflow-y-auto">
          <AnimatePresence>
            {liveComments.map((comment, index) => (
              <motion.div
                key={`${comment}_${index}`}
                className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {comment}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Interaction Controls */}
      <div className="space-y-4">
        {!isJoined ? (
          <button
            onClick={handleJoinRoom}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Join Live Session
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ You're live!
              </span>
              <button
                onClick={handleLeaveRoom}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Leave
              </button>
            </div>
            
            {/* Reaction Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => addReaction('heart')}
                className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full hover:scale-110 transition-transform"
              >
                <Heart className="w-5 h-5 text-red-500" />
              </button>
              <button
                onClick={() => addReaction('thumbs_up')}
                className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:scale-110 transition-transform"
              >
                <ThumbsUp className="w-5 h-5 text-blue-500" />
              </button>
              <button
                onClick={() => addReaction('star')}
                className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full hover:scale-110 transition-transform"
              >
                <Star className="w-5 h-5 text-yellow-500" />
              </button>
              <button
                onClick={() => addReaction('fire')}
                className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full hover:scale-110 transition-transform"
              >
                <span className="text-orange-500 text-lg">🔥</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialShoppingRoom;