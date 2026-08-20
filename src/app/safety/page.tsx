import { Metadata } from 'next';
import { ShieldAlert, ShieldCheck, MapPin, EyeOff, Key } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Safety Guidelines | FoundIt',
};

export default function SafetyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <ShieldCheck className="w-16 h-16 mx-auto text-[var(--color-primary-600)] mb-4" />
        <h1 className="text-4xl font-bold mb-4">Safety & Privacy</h1>
        <p className="text-xl text-[var(--text-secondary)]">
          Your safety is our top priority. Please review these guidelines before arranging a return.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-[var(--bg-secondary)] p-8 rounded-3xl border border-[var(--border-primary)]">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Meeting in Person</h2>
          </div>
          <ul className="space-y-4 text-[var(--text-secondary)] list-disc pl-5">
            <li><strong>Always meet in a public, well-lit place.</strong> Coffee shops, shopping malls, or directly outside a local police station are the best options.</li>
            <li><strong>Bring a friend.</strong> If possible, do not go alone. Let someone know where you are going and who you are meeting.</li>
            <li><strong>Meet during daylight hours.</strong> Avoid secluded areas or meeting late at night.</li>
            <li><strong>Trust your instincts.</strong> If a situation feels unsafe, leave immediately.</li>
          </ul>
        </section>

        <section className="bg-[var(--bg-secondary)] p-8 rounded-3xl border border-[var(--border-primary)]">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold">Protecting Against Scams</h2>
          </div>
          <ul className="space-y-4 text-[var(--text-secondary)] list-disc pl-5">
            <li><strong>Never send money.</strong> FoundIt is a free community service. Never wire money or send gift cards to someone claiming they found your item.</li>
            <li><strong>Beware of verification codes.</strong> Do not give anyone a "Google Voice verification code" or any other 2FA code if they ask. This is a common scam.</li>
            <li><strong>Verify the item first.</strong> If you lost a phone, use the FoundIt verification system to ensure the finder actually has the device before meeting up.</li>
          </ul>
        </section>

        <section className="bg-[var(--bg-secondary)] p-8 rounded-3xl border border-[var(--border-primary)]">
          <div className="flex items-center gap-3 mb-4">
            <EyeOff className="w-6 h-6 text-[var(--color-primary-500)]" />
            <h2 className="text-2xl font-bold">Data Privacy</h2>
          </div>
          <ul className="space-y-4 text-[var(--text-secondary)] list-disc pl-5">
            <li><strong>Automatic EXIF Stripping.</strong> When you upload photos to FoundIt, we automatically strip hidden GPS metadata to prevent your home location from being exposed.</li>
            <li><strong>Secure Messaging.</strong> Use our built-in chat system. You do not need to give out your real phone number or email address to the other party.</li>
            <li><strong>Anonymous Reporting.</strong> Your profile name is visible, but your exact location and private details remain hidden.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
