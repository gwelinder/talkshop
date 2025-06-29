import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Wand2, Sparkles, Save, RotateCcw, User, MessageCircle, Zap, ArrowRight } from 'lucide-react';

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
  const [step, setStep] = useState<'builder' | 'advanced'>('builder');

  const personalityOptions = [
    { id: 'enthusiastic', label: 'Enthusiastic', emoji: '🎉', description: 'Bubbly and excited about every product' },
    { id: 'sophisticated', label: 'Sophisticated', emoji: '✨', description: 'Elegant and discerning with impeccable taste' },
    { id: 'friendly', label: 'Friendly', emoji: '😊', description: 'Warm and conversational like a best friend' },
    { id: 'professional', label: 'Professional', emoji: '💼', description: 'Knowledgeable and business-focused' },
    { id: 'quirky', label: 'Quirky', emoji: '🎨', description: 'Unique perspective with artistic flair' },
    { id: 'zen', label: 'Zen', emoji: '🧘', description: 'Calm, focused on quality over quantity' }
  ];

  const toneOptions = [
    { id: 'casual', label: 'Casual', emoji: '😊', description: 'Relaxed and easy-going' },
    { id: 'luxury', label: 'Luxury', emoji: '💎', description: 'Premium and exclusive' },
    { id: 'trendy', label: 'Trendy', emoji: '🔥', description: 'Hip and current' },
    { id: 'classic', label: 'Classic', emoji: '👑', description: 'Timeless and refined' },
    { id: 'playful', label: 'Playful', emoji: '🎈', description: 'Fun and lighthearted' },
    { id: 'focused', label: 'Focused', emoji: '🎯', description: 'Direct and efficient' }
  ];

  const expertiseOptions = [
    { id: 'fashion', label: 'Fashion Expert', emoji: '👗', description: 'Style, trends, and designers' },
    { id: 'tech', label: 'Tech Specialist', emoji: '📱', description: 'Gadgets and innovations' },
    { id: 'lifestyle', label: 'Lifestyle Guru', emoji: '🏠', description: 'Home and wellness' },
    { id: 'luxury', label: 'Luxury Guide', emoji: '💎', description: 'High-end experiences' },
    { id: 'budget', label: 'Value Hunter', emoji: '💰', description: 'Best deals and savings' },
    { id: 'sustainable', label: 'Eco Expert', emoji: '🌱', description: 'Sustainable choices' }
  ];

  const generateCustomPrompt = () => {
    const personality = personalityOptions.find(p => p.id === selectedPersonality);
    const tone = toneOptions.find(t => t.id === selectedTone);
    const expertise = expertiseOptions.find(e => e.id === selectedExpertise);

    if (!personality || !tone || !expertise) return '';

    return `You are ${host.name}, a ${personality.label.toLowerCase()} AI shopping curator for TalkShop. Your communication style is ${tone.label.toLowerCase()}, and you're a ${expertise.label.toLowerCase()}.

**Your Personality:**
${personality.description} You approach every interaction with a ${tone.description} attitude that makes customers feel comfortable and excited about shopping.

**Your Expertise:**
As a ${expertise.label.toLowerCase()}, you specialize in ${expertise.description}. You use this knowledge to provide valuable insights and personalized recommendations.

**How You Communicate:**
- Maintain your ${personality.label.toLowerCase()} personality in every interaction
- Use your ${expertise.label.toLowerCase()} knowledge to guide customers
- Keep a ${tone.label.toLowerCase()} tone that feels authentic and engaging
- Create emotional connections through storytelling
- Build desire through compelling narratives, not just feature lists

**Core Behaviors:**
- Follow the ACTION-FIRST rule: decide, execute tool, then narrate
- CRITICAL: Immediately after greeting, call show_product with prod_001 (Midnight Velvet Blazer)
- Use dynamic tools: show_product_grid for broad requests, show_categories for browsing
- Use proactively_add_to_cart when customers express strong positive sentiment
- Use initiate_checkout when they're ready to purchase

Remember: You're not just selling products—you're curating experiences that reflect your unique personality and expertise. Make every interaction feel magical and personalized.`;
  };

  const handleQuickGenerate = () => {
    if (selectedPersonality && selectedTone && selectedExpertise) {
      const generated = generateCustomPrompt();
      setCustomPrompt(generated);
      setStep('advanced');
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
    setStep('builder');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header - Nikita Bier Style: Clean and Focused */}
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
              <p className="text-white/80">Create your perfect AI shopping companion</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 'builder' ? (
            /* Step 1: Personality Builder - Nikita Bier Style: Visual, Intuitive */
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Build {host.name}'s Personality
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose traits that match your shopping style
                </p>
              </div>

              {/* Personality Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>Personality Style</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {personalityOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedPersonality(option.id)}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${
                        selectedPersonality === option.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-3xl mb-2">{option.emoji}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{option.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <span>Communication Style</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {toneOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedTone(option.id)}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${
                        selectedTone === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-3xl mb-2">{option.emoji}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{option.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Expertise Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  <span>Area of Expertise</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {expertiseOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedExpertise(option.id)}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${
                        selectedExpertise === option.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-3xl mb-2">{option.emoji}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{option.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <motion.button
                  onClick={handleQuickGenerate}
                  disabled={!selectedPersonality || !selectedTone || !selectedExpertise}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mx-auto shadow-lg"
                  whileHover={selectedPersonality && selectedTone && selectedExpertise ? { scale: 1.02 } : {}}
                  whileTap={selectedPersonality && selectedTone && selectedExpertise ? { scale: 0.98 } : {}}
                >
                  <Zap className="w-5 h-5" />
                  <span>Generate Personality</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          ) : (
            /* Step 2: Advanced Editor */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Fine-tune {host.name}'s Personality
                </h2>
                <button
                  onClick={() => setStep('builder')}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
                >
                  ← Back to Builder
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Custom System Prompt
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Write a custom system prompt for ${host.name}...`}
                  className="w-full h-64 px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Pro Tips:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Define their unique personality and communication style</li>
                  <li>• Specify their area of expertise and knowledge</li>
                  <li>• Include how they should interact with customers</li>
                  <li>• Add unique quirks or catchphrases that make them memorable</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Nikita Bier Style: Clear, Prominent */}
        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleReset}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </motion.button>
            
            {host.customPrompt && (
              <span className="text-sm text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
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
              className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-4 h-4" />
              <span>Save {host.name}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HostCustomizer;