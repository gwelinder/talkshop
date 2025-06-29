import React, { useState, useEffect } from 'react';
import { Flame, Eye, ShoppingCart } from 'lucide-react';

const FOMORibbon: React.FC = () => {
  const [stats, setStats] = useState({
    recentPurchases: 12,
    currentViewers: 47,
    timeframe: '10 min'
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        recentPurchases: Math.max(1, prev.recentPurchases + Math.floor(Math.random() * 3) - 1),
        currentViewers: Math.max(10, prev.currentViewers + Math.floor(Math.random() * 10) - 5)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-xl text-white px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center space-x-2 animate-pulse-glow">
        <Flame className="w-4 h-4 text-yellow-300" />
        <span className="text-sm font-semibold">
          🔥 {stats.recentPurchases} bought in last {stats.timeframe}
        </span>
        <div className="w-px h-4 bg-white/30 mx-2" />
        <Eye className="w-4 h-4" />
        <span className="text-sm">{stats.currentViewers} viewing</span>
      </div>
    </div>
  );
};

export default FOMORibbon;