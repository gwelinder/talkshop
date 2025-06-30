import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle, CreditCard, Users } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Terms of Service</h1>
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
              <Scale className="w-6 h-6 text-brand-500" />
              <span>Agreement to Terms</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to TalkShop! These Terms of Service ("Terms") govern your use of our AI-powered shopping platform operated by TalkShop ("we," "us," or "our"). By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Service Description</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              TalkShop provides an AI-powered shopping platform that includes:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Interactive AI shopping assistants with video and voice capabilities</li>
              <li>Personalized product recommendations and style analysis</li>
              <li>Virtual try-on and product visualization features</li>
              <li>Social shopping experiences and content sharing</li>
              <li>Subscription-based premium features and services</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Users className="w-6 h-6 text-brand-500" />
              <span>User Accounts</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Creation</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You may create an account using Google OAuth. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Eligibility</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You must be at least 13 years old to use our service. If you are under 18, you must have parental consent to use our service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Security</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-brand-500" />
              <span>Acceptable Use</span>
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You agree not to use our service to:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          {/* AI Interactions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">AI Interactions and Content</h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700 mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Important:</strong> Our AI assistants are powered by artificial intelligence and may not always provide accurate information. Product recommendations and advice should not be considered professional guidance.
              </p>
            </div>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>AI conversations may be recorded and analyzed to improve our service</li>
              <li>You retain ownership of content you create, but grant us license to use it for service improvement</li>
              <li>We reserve the right to moderate and remove inappropriate content</li>
              <li>AI-generated content is provided "as is" without warranties</li>
            </ul>
          </section>

          {/* Subscription and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-brand-500" />
              <span>Subscription and Payments</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Subscription Tiers</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li><strong>Free:</strong> Limited daily AI interactions</li>
                  <li><strong>Plus ($9.99/month):</strong> Unlimited voice, limited video sessions</li>
                  <li><strong>VIP ($29.99/month):</strong> Unlimited access to all features</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Billing and Cancellation</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Subscriptions are billed monthly in advance</li>
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>No refunds for partial months</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Price Changes</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We reserve the right to modify subscription prices with 30 days' notice. Existing subscribers will be notified before any price changes take effect.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Intellectual Property</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Our Content</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The service and its original content, features, and functionality are owned by TalkShop and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Content</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You retain ownership of content you submit to our service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content for the purpose of operating and improving our service.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Privacy and Data Protection</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our service, you consent to the collection and use of information as outlined in our Privacy Policy.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-brand-500" />
              <span>Disclaimers and Limitations</span>
            </h2>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700 mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Important Disclaimers:</strong>
              </p>
            </div>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Our service is provided "as is" without warranties of any kind</li>
              <li>We do not guarantee the accuracy of AI-generated recommendations</li>
              <li>We are not responsible for third-party products or services</li>
              <li>Our liability is limited to the amount you paid for the service</li>
              <li>We do not warrant that the service will be uninterrupted or error-free</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Termination</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>Technical or security reasons</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Governing Law</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms will be resolved through binding arbitration.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Changes to Terms</h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h2>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Email:</strong> legal@shop.tilpas.studio</p>
                <p><strong>Website:</strong> https://shop.tilpas.studio</p>
                <p><strong>Address:</strong> TalkShop Legal Team, [Your Business Address]</p>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;