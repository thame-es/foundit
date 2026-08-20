import { requireAuth } from '@/lib/auth/guards';
import { User, Shield, Bell, CreditCard } from 'lucide-react';
import { DeleteAccountSection } from '@/components/dashboard/DeleteAccountSection';

export const metadata = {
  title: 'Settings | Dashboard | FoundIt',
};

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your account preferences and personal information.</p>
      </div>

      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
        
        {/* Profile Section */}
        <div className="p-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Profile Information</h2>
              <p className="text-sm text-[var(--text-secondary)]">Update your display name and email.</p>
            </div>
          </div>
          
          <form className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Display Name</label>
              <input type="text" defaultValue={user.displayName} className="w-full px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email Address</label>
              <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-70 cursor-not-allowed" />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Email address cannot be changed.</p>
            </div>
            <button type="button" className="px-6 py-2 bg-[var(--color-primary-600)] text-white font-medium rounded-xl hover:bg-[var(--color-primary-700)] transition-colors">
              Save Changes
            </button>
          </form>
        </div>

        {/* Security Section (Stub) */}
        <div className="p-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Security</h2>
              <p className="text-sm text-[var(--text-secondary)]">Manage your password and security preferences.</p>
            </div>
          </div>
          <button type="button" className="px-6 py-2 border border-[var(--border-primary)] font-medium rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
            Change Password
          </button>
        </div>

      </div>

      {/* Danger Zone — Separate card for visual distinction */}
      <div className="bg-[var(--bg-primary)] rounded-2xl border-2 border-red-200 shadow-sm overflow-hidden">
        <DeleteAccountSection />
      </div>
    </div>
  );
}
