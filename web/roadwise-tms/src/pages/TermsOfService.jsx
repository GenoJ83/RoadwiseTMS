import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/logo.jpeg" 
                  alt="RoadWise TMS Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900">RoadWise TMS</h1>
            </div>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using the RoadWise TMS (Traffic Management System), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p className="mb-3">RoadWise TMS provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Real-time traffic monitoring and control systems</li>
                <li>Automated traffic signal optimization</li>
                <li>Traffic flow analysis and reporting</li>
                <li>Emergency traffic management capabilities</li>
                <li>User role-based access and management</li>
                <li>Mobile and web-based interfaces</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts and Registration</h2>
              <p className="mb-3">To access certain features of the service, you must register for an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use Policy</h2>
              <p className="mb-3">You agree not to use the service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the system</li>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Transmit any malicious code or harmful content</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or store personal data without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Traffic Officer Responsibilities</h2>
              <p className="mb-3">Traffic officers using the system agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the system in accordance with traffic management protocols</li>
                <li>Maintain confidentiality of sensitive traffic data</li>
                <li>Report system issues or anomalies promptly</li>
                <li>Follow emergency procedures when required</li>
                <li>Use manual override capabilities responsibly</li>
                <li>Maintain accurate logs of system interactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Road User Responsibilities</h2>
              <p className="mb-3">Road users accessing the system agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use traffic information for planning purposes only</li>
                <li>Not rely solely on system data for navigation decisions</li>
                <li>Follow actual traffic signals and road signs</li>
                <li>Report inaccurate or outdated information</li>
                <li>Use the system responsibly and safely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property Rights</h2>
              <p>The RoadWise TMS and its original content, features, and functionality are owned by the Traffic Management Division and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Privacy and Data Protection</h2>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Service Availability</h2>
              <p className="mb-3">We strive to maintain high service availability but cannot guarantee uninterrupted access. The service may be temporarily unavailable due to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Scheduled maintenance and updates</li>
                <li>Technical difficulties or system failures</li>
                <li>Network connectivity issues</li>
                <li>Emergency situations requiring system shutdown</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Disclaimers and Limitations</h2>
              <p className="mb-3">The service is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties that the service will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy or reliability of traffic data</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Limitation of Liability</h2>
              <p>In no event shall the Traffic Management Division be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Indemnification</h2>
              <p>You agree to defend, indemnify, and hold harmless the Traffic Management Division from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the service or violation of these terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Termination</h2>
              <p>We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Governing Law</h2>
              <p>These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which the Traffic Management Division operates, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on our website and updating the "Last updated" date.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">16. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> legal@roadwise-tms.com</p>
                <p><strong>Phone:</strong> +256-781-642869</p>
                <p><strong>Address:</strong> Traffic Management Division</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService; 