import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 8, 2025</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Ping Me, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Ping Me is a marketplace platform that connects startup founders with venture capitalists. We facilitate introductions through a paid system where founders can access VC contact information and receive personalized introduction templates.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">As a user of our platform, you agree to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Use the platform for legitimate business purposes only</li>
              <li>Respect the privacy and preferences of other users</li>
              <li>Not spam or abuse the contact information provided</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
            <p className="text-gray-700 mb-4">
              Payment is required to access VC contact information. All payments are processed securely through Stripe. By making a payment, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Pay the full amount due at the time of purchase</li>
              <li>Provide accurate payment information</li>
              <li>Understand that payments are generally non-refundable</li>
              <li>Contact us immediately if there are any billing issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Refund Policy</h2>
            <p className="text-gray-700 mb-4">
              We offer a money-back guarantee if you are not satisfied with the quality of the VC contact information or introduction template. Refund requests must be submitted within 7 days of purchase through our support system.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. VC Verification</h2>
            <p className="text-gray-700 mb-4">
              All VCs on our platform undergo a verification process. However, we cannot guarantee the accuracy of all information or the success of any introductions. Users should conduct their own due diligence.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Ping Me shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service. Our liability is limited to the amount paid for the specific transaction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any reason, including breach of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service, please contact us through our{" "}
              <Link href="/support" className="text-blue-600 hover:text-blue-800">support page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}