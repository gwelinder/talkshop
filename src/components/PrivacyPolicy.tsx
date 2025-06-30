import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Users, Globe, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App</span>
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
              <p className="text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Eye className="w-6 h-6 text-brand-500" />
              <span>Introduction</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to TalkShop ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered shopping platform. We are committed to protecting your privacy and ensuring transparency about our data practices.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Users className="w-6 h-6 text-brand-500" />
              <span>Information We Collect</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Name and email address (via Google OAuth)</li>
                  <li>Profile picture (if provided through Google)</li>
                  <li>Shopping preferences and history</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>AI conversation transcripts and interactions</li>
                  <li>Products viewed, searched, and purchased</li>
                  <li>Session duration and frequency</li>
                  <li>Device information and browser type</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Video and Audio Data</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Video feeds during AI shopping sessions (processed in real-time, not stored)</li>
                  <li>Audio recordings for voice interactions (processed and deleted after session)</li>
                  <li>Style analysis data (anonymized and aggregated)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Lock className="w-6 h-6 text-brand-500" />
              <span>How We Use Your Information</span>
            </h2>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Provide personalized AI shopping experiences</li>
              <li>Process transactions and manage your account</li>
              <li>Improve our AI models and recommendation algorithms</li>
              <li>Send important updates about your account or our services</li>
              <li>Analyze usage patterns to enhance platform performance</li>
              <li>Comply with legal obligations and prevent fraud</li>
            </ul>
          </section>

          {/* Google OAuth Integration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Globe className="w-6 h-6 text-brand-500" />
              <span>Google OAuth Integration</span>
            </h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We use Google OAuth for secure authentication. When you sign in with Google, we only access your basic profile information (name, email, and profile picture). We do not access your Google Drive, Gmail, or other Google services. You can revoke this access at any time through your Google Account settings.
              </p>
            </div>
          </section>

          {/* Data Sharing and Disclosure */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Data Sharing and Disclosure</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Service Providers:</strong> With trusted partners who help us operate our platform (Supabase, Tavus, ElevenLabs)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Data Security</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement industry-standard security measures to protect your information, including encryption in transit and at rest, secure authentication protocols, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Your Rights</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Cookies and Tracking</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes. You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Children's Privacy</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">International Users</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you are accessing our service from outside the United States, please note that your information may be transferred to, stored, and processed in the United States where our servers are located and our central database is operated.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Changes to This Privacy Policy</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Mail className="w-6 h-6 text-brand-500" />
              <span>Contact Us</span>
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Email:</strong> privacy@shop.tilpas.studio</p>
                <p><strong>Website:</strong> https://shop.tilpas.studio</p>
                <p><strong>Address:</strong> TalkShop Privacy Team, [Your Business Address]</p>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;