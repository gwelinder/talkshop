import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Wand2, Sparkles, Save, RotateCcw, User, MessageCircle, Zap } from 'lucide-react';

interface Host {
  id: string;
  name: string;
  replicaId: string;
  description: string;
  specialty: string;
  personality: string;
  image: string;
  customPrompt?: string;
}

interface HostCustomizerProps {
  host: Host;
  onSave: (customizedHost: Host) => void;
  onClose: () => void;
}

const HostCustomizer: React.FC<HostCustomizerProps> = ({ host, onSave, onClose }) => {
  const [customPrompt, setCustomPrompt] = useState(host.customPrompt || '');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');

  const personalityOptions = [
    { id: 'enthusiastic', label: 'Enthusiastic & Energetic', description: 'Bubbly and excited about every product' },
    { id: 'sophisticated', label: 'Sophisticated & Refined', description: 'Elegant and discerning with impeccable taste' },
    { id: 'friendly', label: 'Friendly & Approachable', description: 'Warm and conversational like a best friend' },
    { id: 'professional', label: 'Professional & Expert', description: 'Knowledgeable and business-focused' },
    { id: 'quirky', label: 'Quirky & Creative', description: 'Unique perspective with artistic flair' },
    { id: 'minimalist', label: 'Minimalist & Zen', description: 'Calm, focused on quality over quantity' }
  ];

  const toneOptions = [
    { id: 'casual', label: 'Casual & Relaxed', emoji: '😊' },
    { id: 'luxury', label: 'Luxury & Premium', emoji: '✨' },
    { id: 'trendy', label: 'Trendy & Hip', emoji: '🔥' },
    { id: 'classic', label: 'Classic & Timeless', emoji: '👑' },
    { id: 'playful', label: 'Playful & Fun', emoji: '🎉' },
    { id: 'serious', label: 'Serious & Focused', emoji: '🎯' }
  ];

  const expertiseOptions = [
    { id: 'fashion', label: 'Fashion Expert', description: 'Deep knowledge of style, trends, and designers' },
    { id: 'tech', label: 'Tech Specialist', description: 'Latest gadgets, specs, and innovations' },
    { id: 'lifestyle', label: 'Lifestyle Guru', description: 'Home, wellness, and life enhancement' },
    { id: 'luxury', label: 'Luxury Connoisseur', description: 'High-end products and premium experiences' },
    { id: 'budget', label: 'Value Hunter', description: 'Best deals and cost-effective choices' },
    { id: 'sustainable', label: 'Sustainability Advocate', description: 'Eco-friendly and ethical products' }
  ];

  const generateCustomPrompt = () => {
    const personality = personalityOptions.find(p => p.id === selectedPersonality);
    const tone = toneOptions.find(t => t.id === selectedTone);
    const expertise = expertiseOptions.find(e => e.id === selectedExpertise);

    if (!personality || !tone || !expertise) return '';

    return `You are ${host.name}, a ${personality.label.toLowerCase()} AI shopping curator for TalkShop. Your communication style is ${tone.label.toLowerCase()}, and you're a ${expertise.label.toLowerCase()}. 

**Personality & Style:**
${personality.description} Your ${tone.label.toLowerCase()} approach makes every interaction feel natural and engaging.

**Expertise & Knowledge:**
${expertise.description} You use this expertise to provide valuable insights and recommendations.

**Behavior Guidelines:**
- Always maintain your ${personality.label.toLowerCase()} personality while helping customers
- Use your ${expertise.label.toLowerCase()} knowledge to provide expert guidance
- Communicate in a ${tone.label.toLowerCase()} manner that feels authentic to your character
- Follow the ACTION-FIRST rule: decide, execute tool, then narrate
- CRITICAL: Immediately after greeting, call show_product with prod_001 (Midnight Velvet Blazer)
- Use dynamic presentation tools: show_product_grid for broad requests, show_categories for browsing
- Use proactively_add_to_cart when users express strong positive sentiment
- Create desire through compelling narratives, not just feature lists

Remember: You're not just selling products—you're curating experiences that match your unique personality and expertise.`;
  };

  const handleQuickGenerate = () => {
    if (selectedPersonality && selectedTone && selectedExpertise) {
      setCustomPrompt(generateCustomPrompt());
    }
  };

  const handleSave = () => {
    const customizedHost: Host = {
      ...host,
      customPrompt: customPrompt.trim() || undefined
    };
    onSave(customizedHost);
  };

  const handleReset = () => {
    setCustomPrompt('');
    setSelectedPersonality('');
    setSelectedTone('');
    setSelectedExpertise('');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-brand-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close customizer"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
              <img src={host.image} alt={host.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <Wand2 className="w-6 h-6" />
                <span>Customize {host.name}</span>
              </h1>
              <p className="text-white/80">Personalize your AI shopping curator's personality and expertise</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Customization */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span>Quick Personality Builder</span>
                </h3>
                
                {/* Personality Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Personality Style
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {personalityOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => setSelectedPersonality(option.id)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          selectedPersonality === option.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Tone Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Communication Tone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {toneOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => setSelectedTone(option.id)}
                        className={`p-3 rounded-lg border transition-all text-center ${
                          selectedTone === option.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="text-2xl mb-1">{option.emoji}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Expertise Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Area of Expertise
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {expertiseOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => setSelectedExpertise(option.id)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          selectedExpertise === option.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <motion.button
                  onClick={handleQuickGenerate}
                  disabled={!selectedPersonality || !selectedTone || !selectedExpertise}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={selectedPersonality && selectedTone && selectedExpertise ? { scale: 1.02 } : {}}
                  whileTap={selectedPersonality && selectedTone && selectedExpertise ? { scale: 0.98 } : {}}
                >
                  <Zap className="w-4 h-4" />
                  <span>Generate Custom Prompt</span>
                </motion.button>
              </div>
            </div>

            {/* Custom Prompt Editor */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-brand-500" />
                <span>Custom System Prompt</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Prompt (Advanced)
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={`Write a custom system prompt for ${host.name}. This will define their personality, expertise, and how they interact with customers...`}
                    className="w-full h-64 px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 resize-none"
                  />
                </div>

                {/* Preview */}
                {customPrompt && (
                  <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Preview:</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                      {customPrompt.slice(0, 200)}...
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Tips for Great Prompts:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Define their personality and communication style</li>
                    <li>• Specify their area of expertise and knowledge</li>
                    <li>• Include how they should interact with customers</li>
                    <li>• Add unique quirks or catchphrases</li>
                    <li>• Remember to include the ACTION-FIRST rule</li>
                    <li>• Specify tool usage patterns for their specialty</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={handleReset}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </motion.button>
            
            {host.customPrompt && (
              <span className="text-sm text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                Currently Customized
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSave}
              className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-4 h-4" />
              <span>Save Customization</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HostCustomizer;