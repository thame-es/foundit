import { CheckCircle2, Building, ShieldCheck, Info } from 'lucide-react';
import { format } from 'date-fns';

interface UserTrustProfileProps {
  user: {
    displayName: string;
    createdAt: Date;
    emailVerified: boolean;
    businessAccount?: { verified: boolean } | null;
  };
  successfulReturns: number;
}

export function UserTrustProfile({ user, successfulReturns }: UserTrustProfileProps) {
  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl p-6 shadow-sm border border-[var(--border-primary)]">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Reported By</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] flex items-center justify-center text-white font-bold text-lg shrink-0">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Member since {format(user.createdAt, 'MMM yyyy')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {user.emailVerified && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Email verified</span>
          </div>
        )}
        
        {user.businessAccount?.verified && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Building className="w-4 h-4 text-blue-500" />
            <span>Verified Organisation</span>
          </div>
        )}

        {successfulReturns > 0 && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>{successfulReturns} successful return{successfulReturns !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function TrustExplanation() {
  return (
    <div className="mt-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
      <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-[var(--text-primary)]">
        <Info className="w-4 h-4" /> How FoundIt protects you
      </h4>
      <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 ml-5 list-disc">
        <li><strong className="text-[var(--text-primary)]">Private Verification:</strong> Handover details are kept secret until a claim is verified.</li>
        <li><strong className="text-[var(--text-primary)]">In-App Messaging:</strong> Communicate safely without sharing personal contact details.</li>
        <li><strong className="text-[var(--text-primary)]">Meeting Safely:</strong> Always arrange handovers in public, well-lit spaces.</li>
        <li><strong className="text-[var(--text-primary)]">Reporting:</strong> You can report or block users at any time.</li>
      </ul>
    </div>
  );
}
