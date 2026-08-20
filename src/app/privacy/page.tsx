export const metadata = {
  title: 'Privacy Policy | FoundIt',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Privacy Policy</h1>
      
      <p className="text-[var(--text-secondary)] mb-8">Last updated: August 20, 2026</p>
      
      <div className="space-y-8 text-[var(--text-secondary)]">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Introduction</h2>
          <p className="leading-relaxed">
            At FoundIt, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. Data We Collect</h2>
          <p className="leading-relaxed mb-4">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Location Data:</strong> includes approximate geographical location when reporting an item.</li>
            <li><strong>Transaction Data:</strong> includes details about items you have lost, found, or claimed.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. How We Use Your Data</h2>
          <p className="leading-relaxed">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            <br/><br/>
            - Where we need to perform the contract we are about to enter into or have entered into with you.<br/>
            - Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.<br/>
            - Where we need to comply with a legal obligation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Data Security</h2>
          <p className="leading-relaxed">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>
      </div>
    </div>
  );
}
