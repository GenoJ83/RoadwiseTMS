import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const CookiePolicy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies?</h2>
              <p>Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Cookies</h2>
              <p className="mb-3">RoadWise TMS uses cookies for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication:</strong> To keep you logged in and maintain your session</li>
                <li><strong>Preferences:</strong> To remember your language, theme, and display settings</li>
                <li><strong>Analytics:</strong> To understand how users interact with our system</li>
                <li><strong>Performance:</strong> To improve website speed and functionality</li>
                <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
                <li><strong>Traffic Data:</strong> To store temporary traffic information for better user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="mb-2">These cookies are necessary for the website to function properly. They cannot be disabled.</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Authentication tokens</li>
                    <li>Session management</li>
                    <li>Security features</li>
                    <li>Load balancing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="mb-2">These Cookies enhance your experience by remembering your preferences.</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Language preferences</li>
                    <li>Theme settings</li>
                    <li>Dashboard layout preferences</li>
                    <li>Traffic light display settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Cookies</h3>
                  <p className="mb-2">These cookies help us understand how visitors use our website.</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Page visit statistics</li>
                    <li>Feature usage patterns</li>
                    <li>Error tracking</li>
                    <li>Performance monitoring</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Traffic Management Cookies</h3>
                  <p className="mb-2">These cookies store temporary traffic data for system optimization.</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Traffic flow preferences</li>
                    <li>Route planning data</li>
                    <li>Emergency mode settings</li>
                    <li>Real-time traffic updates</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Cookies</h2>
              <p className="mb-3">We may use third-party services that set their own cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Firebase:</strong> For authentication and real-time data synchronization</li>
                <li><strong>Twilio:</strong> For SMS notifications and communication services</li>
                <li><strong>Maps Services:</strong> For route planning and location-based features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookie Duration</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Session Cookies</h3>
                  <p className="text-sm">These cookies are deleted when you close your browser. They include authentication tokens and temporary session data.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Persistent Cookies</h3>
                  <p className="text-sm">These cookies remain on your device for a set period (usually 30 days to 1 year). They include preferences and analytics data.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Managing Your Cookie Preferences</h2>
              <p className="mb-3">You can control and manage cookies in several ways:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Browser Settings:</strong> Most browsers allow you to control cookies through their settings</li>
                <li><strong>Cookie Consent:</strong> We provide cookie consent options when you first visit our site</li>
                <li><strong>Opt-out Tools:</strong> You can use browser extensions to manage cookies</li>
                <li><strong>Contact Us:</strong> Reach out to us for assistance with cookie management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Browser-Specific Instructions</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Chrome</h3>
                  <p className="text-sm">Settings → Privacy and security → Cookies and other site data</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Firefox</h3>
                  <p className="text-sm">Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Safari</h3>
                  <p className="text-sm">Preferences → Privacy → Manage Website Data</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Edge</h3>
                  <p className="text-sm">Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Impact of Disabling Cookies</h2>
              <p className="mb-3">If you choose to disable cookies, some features of RoadWise TMS may not work properly:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may need to log in repeatedly</li>
                <li>Your preferences may not be saved</li>
                <li>Some traffic management features may be limited</li>
                <li>Real-time updates may not function correctly</li>
                <li>Analytics and performance monitoring may be affected</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Updates to This Policy</h2>
              <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
              <p>If you have any questions about our use of cookies or this Cookie Policy, please contact us:</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> privacy@roadwise-tms.com</p>
                <p><strong>Phone:</strong> +256-41-ROADWISE</p>
                <p><strong>Address:</strong> Traffic Management Division, Kampala Capital City Authority, Plot 1-3 Apollo Kaggwa Road, Kampala, Uganda</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy; 