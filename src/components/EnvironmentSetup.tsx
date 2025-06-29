import React, { useState } from 'react';
import { Key, AlertCircle, CheckCircle, ExternalLink, TestTube, Zap, Settings, Code } from 'lucide-react';
import { testTavusConnection, getApiConfig } from '../services/tavusService';

interface EnvironmentSetupProps {
  onSetup: () => void;
}

const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({ onSetup }) => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showDemo, setShowDemo] = useState(false);

  const apiConfig = getApiConfig();

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const isValid = await testTavusConnection();
    setConnectionStatus(isValid ? 'success' : 'error');
    setIsTestingConnection(false);
  };

  const handleContinue = () => {
    onSetup();
  };

  const handleDemoMode = () => {
    onSetup();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full border border-gray-200 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TalkShop AI</h1>
          <p className="text-gray-600">AI-powered video shopping with Tavus</p>
          
          {/* Development Mode Indicator */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2 text-yellow-800">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">Development Mode</span>
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              This setup screen only appears in development. Production users go directly to the app.
            </p>
          </div>
        </div>

        {!showDemo ? (
          <div className="space-y-6">
            {/* API Configuration Status */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900 font-semibold flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configuration</span>
                </h3>
                {apiConfig.isDemo ? (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    Demo Mode
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Production Ready
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="text-gray-900 font-mono">
                    {apiConfig.isDevelopment ? 'Development' : 'Production'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Key:</span>
                  <span className="text-gray-900 font-mono">
                    {apiConfig.isDemo ? 'demo-mode' : '••••••••••••' + apiConfig.apiKey.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Webhook:</span>
                  <span className="text-green-600 text-xs">✓ Built-in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Replica:</span>
                  <span className="text-blue-600 text-xs">r13e554ebaa3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Persona:</span>
                  <span className="text-purple-600 text-xs">pb16b649a4c0</span>
                </div>
              </div>
            </div>

            {/* Connection Test */}
            {!apiConfig.isDemo && (
              <div className="space-y-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {isTestingConnection ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Testing Connection...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      <span>Test API Connection</span>
                    </>
                  )}
                </button>

                {connectionStatus === 'success' && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>API connection successful</span>
                  </div>
                )}
                {connectionStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>API connection failed - check your .env file</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {apiConfig.isDemo ? 'Continue with Demo' : 'Start Shopping with AI'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowDemo(true)}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Learn about demo mode
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">Demo Mode Available</span>
              </div>
              <p className="text-green-700 text-sm mt-2">
                Experience TalkShop with simulated AI agents and tool calling. Perfect for testing the platform before setting up your own Tavus integration.
              </p>
              <div className="mt-3 text-xs text-green-700">
                <p>Demo features:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Simulated video conversations</li>
                  <li>Mock tool calling responses</li>
                  <li>Product showcase animations</li>
                  <li>Cart integration testing</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleDemoMode}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Enter Demo Mode
            </button>

            <button
              onClick={() => setShowDemo(false)}
              className="w-full text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentSetup;