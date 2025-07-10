import { Header } from "@/components/header";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Email addresses for login, product updates, and communication</li>
              <li>Payment data (handled securely via Stripe or other third-party processors)</li>
              <li>Project details submitted by users for platform listings</li>
            </ul>
            <p className="text-gray-600 mb-6">
              We do not sell your data to third parties.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>To enable introductions, listings, and communications</li>
              <li>To process payments and maintain platform functionality</li>
              <li>To provide relevant updates, feature improvements, and customer support</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Data Sharing</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>We only share your data when required to complete services you've opted into (e.g., sending your profile to a VC)</li>
              <li>All payments are processed securely by trusted third parties; Ping Me does not store payment credentials</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Cookies</h2>
            <p className="text-gray-600 mb-6">
              We use essential cookies for login sessions and anonymous analytics to improve platform experience.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
            <p className="text-gray-600 mb-6">
              We retain user data only as long as necessary to fulfill our service obligations or comply with applicable laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">You may:</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Request a copy of your data</li>
              <li>Ask for your data to be deleted or corrected</li>
              <li>Unsubscribe from communications at any time</li>
              <li>Contact us at support@pingme.app for any privacy-related request</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Policy Updates</h2>
            <p className="text-gray-600 mb-6">
              This privacy policy may be updated occasionally. We will notify users of major changes. Continued use implies agreement.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}