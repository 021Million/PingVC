import { Header } from "@/components/header";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">Welcome to Ping VC. By accessing or using our website and services, you agree to be bound by the following Terms of Service. If you do not agree with these terms, please do not use Ping VC.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Overview</h2>
            <p className="text-gray-600 mb-6">Ping VC is a platform that facilitates paid introductions between founders and venture capitalists or angels. Ping VC acts solely as an intermediary and does not guarantee investment outcomes or business success as a result of any introduction.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Eligibility</h2>
            <p className="text-gray-600 mb-6">You must be at least 18 years old to use Ping VC. By using the platform, you confirm you meet this requirement and have the legal capacity to enter into this agreement.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Services and Payments</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>All payments made to Ping VC are non-refundable, unless explicitly stated under specific conditions.</li>
              <li>Ping VC charges a fee for access to introductions and/or for listing services on the platform.</li>
              <li>Venture Capitalists (VCs) and Angels listed on the platform are not employees or agents of Ping VC.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Refund Policy</h2>
            <p className="text-gray-600 mb-4">
              If a VC or Angel does not show up to a scheduled call or fails to respond to a paid introduction request within 5 business days:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>The founder must submit a written complaint to Ping VC at support@pingvc.app within 7 calendar days of the missed appointment or non-response.</li>
              <li>Ping VC will conduct an internal review and may contact both parties for verification.</li>
              <li>If Ping VC confirms the VC did not respond or attend, the founder will be issued a full 100% refund within 10 business days.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. User Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>You agree to use Ping VC lawfully and professionally.</li>
              <li>You will not misrepresent your identity, company, or intentions.</li>
              <li>Spam, harassment, or platform manipulation will result in immediate account removal and potential legal consequences.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. No Guarantees</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Ping VC makes no warranties regarding investment outcomes or responses.</li>
              <li>We do not guarantee the success or quality of any introduction or interaction.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Platform Rights</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>We reserve the right to modify pricing, features, or access at any time without prior notice.</li>
              <li>Ping Me may suspend or terminate accounts at its discretion for violations of these Terms.</li>
              <li>We may update these terms periodically; continued use indicates acceptance.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">Ping VC shall not be liable for indirect, incidental, or consequential damages resulting from use of the platform. Total liability shall not exceed the amount you paid to Ping VC in the preceding 3 months.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These terms are governed by the laws of the United Kingdom, unless otherwise specified.
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