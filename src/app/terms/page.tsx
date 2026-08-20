export const metadata = {
  title: 'Terms of Service | FoundIt',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Terms of Service</h1>
      
      <p className="text-[var(--text-secondary)] mb-8">Last updated: August 20, 2026</p>
      
      <div className="space-y-8 text-[var(--text-secondary)]">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing and using FoundIt ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. User Conduct and Responsibilities</h2>
          <p className="leading-relaxed mb-4">
            As a user of the Service, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate, current, and complete information when reporting lost or found items.</li>
            <li>Maintain the security of your password and identification.</li>
            <li>Accept all responsibility for any and all activities that occur under your account.</li>
            <li>Not use the Service to conduct any fraudulent or illegal activity.</li>
            <li>Not submit false claims on items that do not belong to you.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. Content Ownership</h2>
          <p className="leading-relaxed">
            You retain all ownership rights to the content you post on FoundIt. However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display that content in connection with the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Limitation of Liability</h2>
          <p className="leading-relaxed">
            FoundIt is a platform facilitating the connection between individuals who have lost items and those who have found them. We do not guarantee the recovery of any lost item and are not responsible for the condition of returned items or the actions of users on the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
