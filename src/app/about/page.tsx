import { Building2, Users, Target, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'About Us | FoundIt',
  description: 'Learn more about FoundIt and our mission to reconnect people with their lost belongings.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">About FoundIt</h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          We are on a mission to create a world where lost items always find their way back home, powered by community trust and secure verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="space-y-6">
          <div className="w-12 h-12 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Our Mission</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Every day, millions of valuable items are lost. Our mission is to provide a seamless, secure, and intuitive platform that bridges the gap between those who lose and those who find, fostering a community of integrity.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="w-12 h-12 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Security First</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            We prioritize your privacy and security. By keeping finder information anonymous until a claim is verified, we prevent scams and ensure that items are only returned to their rightful owners.
          </p>
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl p-8 md:p-12 text-center shadow-sm">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Join Our Community</h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
          Whether you've lost something precious or found an item you want to return, you can make a difference today.
        </p>
        <a href="/register" style={{ color: '#ffffff' }} className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] font-medium rounded-xl transition-colors">
          Get Started Now
        </a>
      </div>
    </div>
  );
}
