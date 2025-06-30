import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Wand2, Sparkles, Save, RotateCcw, User, MessageCircle, Zap, ArrowRight, Edit3, Shirt } from 'lucide-react';

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
    { id: 'enthusiastic', label: 'Enthusiastic', emoji: '🎉', description: 'Bubbly and excited about fashion' },
    { id: 'sophisticated', label: 'Sophisticated', emoji: '✨', description: 'Elegant and refined taste' },
    { id: 'friendly', label: 'Friendly', emoji: '😊', description: 'Warm and approachable stylist' },
    { id: 'professional', label: 'Professional', emoji: '💼', description: 'Expert and focused consultant' },
    { id: 'artistic', label: 'Artistic', emoji: '🎨', description: 'Creative and expressive' },
    { id: 'zen', label: 'Zen', emoji: '🧘', description: 'Calm and mindful approach' }
  ];

  const toneOptions = [
    { id: 'casual', label: 'Casual', emoji: '😊', description: 'Relaxed and conversational' },
    { id: 'luxury', label: 'Luxury', emoji: '💎', description: 'Premium and exclusive' },
    { id: 'trendy', label: 'Trendy', emoji: '🔥', description: 'Hip and fashion-forward' },
    { id: 'classic', label: 'Classic', emoji: '👑', description: 'Timeless and refined' },
    { id: 'playful', label: 'Playful', emoji: '🎈', description: 'Fun and lighthearted' },
    { id: 'educational', label: 'Educational', emoji: '📚', description: 'Informative about fashion' }
  ];

  const expertiseOptions = [
    { id: 'personal_stylist', label: 'Personal Stylist', emoji: '👗', description: 'Personalized fashion advice' },
    { id: 'color_analysis', label: 'Color Expert', emoji: '🎨', description: 'Color theory and palettes' },
    { id: 'wardrobe_essentials', label: 'Wardrobe Expert', emoji: '🧥', description: 'Building versatile wardrobes' },
    { id: 'luxury_fashion', label: 'Luxury Fashion', emoji: '💎', description: 'High-end designer knowledge' },
    { id: 'sustainable_fashion', label: 'Sustainable Style', emoji: '🌱', description: 'Eco-conscious fashion' },
    { id: 'body_type_styling', label: 'Body Type Expert', emoji: '✨', description: 'Flattering different figures' }
  ];

  const generateCustomPrompt = () => {
    const personality = personalityOptions.find(p => p.id === selectedPersonality);
    const tone = toneOptions.find(t => t.id === selectedTone);
    const expertise = expertiseOptions.find(e => e.id === selectedExpertise);

    if (!personality || !tone || !expertise) return '';

    return `You are ${host.name}, a ${personality.label.toLowerCase()} AI fashion stylist for TalkShop. Your communication style is ${tone.label.toLowerCase()}, and you're a ${expertise.label.toLowerCase()} specialist.

**Your Fashion Personality:**
${personality.description} You approach every styling session with a ${tone.description} attitude that makes clients feel comfortable and excited about discovering their personal style.

**Your Fashion Expertise:**
As a ${expertise.label.toLowerCase()} specialist, you excel in ${expertise.description}. You use this knowledge to provide valuable fashion insights and personalized style recommendations.

**How You Communicate About Fashion:**
- Maintain your ${personality.label.toLowerCase()} personality in every interaction
- Use your ${expertise.label.toLowerCase()} knowledge to guide fashion choices
- Keep a ${tone.label.toLowerCase()} tone that feels authentic and engaging
- Create emotional connections through fashion storytelling
- Build style confidence through personalized recommendations

**Core Fashion Behaviors:**
- Always greet users warmly by name and establish a personal connection
- Ask about style preferences, lifestyle, and fashion goals
- Offer personalized style analysis when appropriate
- Create dynamic fashion products that perfectly match their aesthetic
- Explain WHY each piece works for their personal style
- Focus on versatility, quality, and authentic self-expression

Remember: You're not just recommending clothes—you're helping people discover and express their unique personal style. Make every interaction feel personalized and transformative.`;
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

  const handleSkipToAdvanced = () => {
    setStep('advanced');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Fashion-Focused Header */}
        <div className="bg-gradient-to-r from-purple-500 to-brand-600 p-3 sm:p-4 lg:p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/80 hover:text-white transition-colors p-1.5 sm:p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close customizer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex items-center space-x-3 sm:space-x-4 pr-8 sm:pr-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
              <img src={host.image} alt={host.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center space-x-2">
                <Shirt className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                <span className="truncate">Customize {host.name}'s Style</span>
              </h1>
              <p className="text-white/80 text-sm sm:text-base hidden sm:block">Create your perfect fashion stylist</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-2 sm:space-x-4">
            <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
              step === 'builder' ? 'bg-white/20 text-white' : 'text-white/60'
            }`}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${step === 'builder' ? 'bg-white' : 'bg-white/40'}`} />
              <span>Style Builder</span>
            </div>
            <div className="w-4 sm:w-8 h-px bg-white/40" />
            <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
              step === 'advanced' ? 'bg-white/20 text-white' : 'text-white/60'
            }`}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${step === 'advanced' ? 'bg-white' : 'bg-white/40'}`} />
              <span>Advanced</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 min-h-0">
          {step === 'builder' ? (
            /* Step 1: Fashion Personality Builder */
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Build {host.name}'s Fashion Personality
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
                  Choose traits that match your ideal fashion stylist
                </p>
                
                {/* Quick Actions */}
                <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                  <button
                    onClick={handleSkipToAdvanced}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Skip to Advanced</span>
                  </button>
                  {host.customPrompt && (
                    <span className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                      Customized
                    </span>
                  )}
                </div>
              </div>

              {/* Fashion Personality Selection */}
              <div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center space-x-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  <span>Stylist Personality</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {personalityOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedPersonality(option.id)}
                      className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-center ${
                        selectedPersonality === option.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-lg sm:text-2xl lg:text-3xl mb-1 sm:mb-2">{option.emoji}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-xs sm:text-sm lg:text-base">{option.label}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Fashion Communication Style */}
              <div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span>Styling Communication</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {toneOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedTone(option.id)}
                      className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-center ${
                        selectedTone === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-lg sm:text-2xl lg:text-3xl mb-1 sm:mb-2">{option.emoji}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-xs sm:text-sm lg:text-base">{option.label}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Fashion Expertise */}
              <div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center space-x-2">
                  <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>Fashion Expertise</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {expertiseOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedExpertise(option.id)}
                      className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-center ${
                        selectedExpertise === option.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-lg sm:text-2xl lg:text-3xl mb-1 sm:mb-2">{option.emoji}</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-xs sm:text-sm lg:text-base">{option.label}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center pt-2 sm:pt-4">
                <motion.button
                  onClick={handleQuickGenerate}
                  disabled={!selectedPersonality || !selectedTone || !selectedExpertise}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg flex items-center justify-center space-x-2 sm:space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mx-auto shadow-lg"
                  whileHover={selectedPersonality && selectedTone && selectedExpertise ? { scale: 1.02 } : {}}
                  whileTap={selectedPersonality && selectedTone && selectedExpertise ? { scale: 0.98 } : {}}
                >
                  <Shirt className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Generate Fashion Personality</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                
                {(!selectedPersonality || !selectedTone || !selectedExpertise) && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">
                    Select one option from each category to continue
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Advanced Fashion Editor */
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Fine-tune {host.name}'s Fashion Expertise
                </h2>
                <button
                  onClick={() => setStep('builder')}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors flex items-center space-x-1 text-sm"
                >
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                  <span>Back</span>
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  Custom Fashion Prompt
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`Write a custom fashion prompt for ${host.name}...

Example:
You are ${host.name}, a sophisticated AI fashion stylist...

Define their fashion expertise, styling approach, and how they should interact with clients.`}
                  className="w-full h-48 sm:h-64 px-3 sm:px-4 py-2 sm:py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 resize-none text-sm sm:text-base"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {customPrompt.length} characters
                  </span>
                  {customPrompt.length > 0 && (
                    <button
                      onClick={() => setCustomPrompt('')}
                      className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Fashion Styling Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Fashion Stylist Tips:</h4>
                <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Define their unique fashion perspective and styling approach</li>
                  <li>• Specify their area of fashion expertise (e.g., color analysis, body types)</li>
                  <li>• Include how they build client relationships and understand needs</li>
                  <li>• Add unique fashion philosophies that make them memorable</li>
                  <li>• Describe how they help clients express their authentic style</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-3 sm:p-4 lg:p-6 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <motion.button
              onClick={handleReset}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Reset</span>
            </motion.button>
            
            {host.customPrompt && (
              <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                Customized
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onClose}
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-xs sm:text-sm"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSave}
              className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center space-x-1 sm:space-x-2 shadow-lg transition-all duration-300 text-xs sm:text-sm lg:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Save</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HostCustomizer;