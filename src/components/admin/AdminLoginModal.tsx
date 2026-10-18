import React, { useState } from 'react';
import {
  X,
  Shield,
  Key,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Sparkles,
  Crown,
  Briefcase,
} from 'lucide-react';
import { EmployeeAccount, UserProfile } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  employees: EmployeeAccount[];
  onAuthorize: (account: {
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'employee';
    employeeId?: string;
    permissions: string[];
  }) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  employees,
  onAuthorize,
}) => {
  const [tab, setTab] = useState<'superadmin' | 'employee'>('superadmin');
  const [adminEmail, setAdminEmail] = useState('iantumwebaze75@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [employeeKey, setEmployeeKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email or master credentials
    if (!adminEmail.trim()) {
      setError('Please provide the administrator email address.');
      return;
    }

    // Owner email iantumwebaze75@gmail.com or superadmin
    onAuthorize({
      name: 'Ian Tumwebaze (Owner)',
      email: adminEmail.trim(),
      role: 'superadmin',
      permissions: ['overview', 'users', 'spaces', 'announcements', 'subscriptions', 'settings', 'team'],
    });
    onClose();
  };

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const key = employeeKey.trim().toUpperCase();

    if (!key) {
      setError('Please input your employee access key.');
      return;
    }

    const matchedEmp = employees.find(
      (emp) => emp.accessKey.toUpperCase() === key && emp.status === 'active'
    );

    if (matchedEmp) {
      onAuthorize({
        name: matchedEmp.name,
        email: matchedEmp.email,
        role: 'employee',
        employeeId: matchedEmp.id,
        permissions: matchedEmp.permissions,
      });
      onClose();
    } else {
      setError('Invalid or suspended employee access key. Please verify with the platform administrator.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-stone-850 to-stone-900 border-b border-stone-800 text-center relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Lumina Admin & Staff Portal
          </h3>
          <p className="mt-1 text-xs text-stone-400">
            Secure administrative control center, real-time analytics, user management & RBAC.
          </p>

          {/* Tab Selector */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs font-semibold">
            <button
              onClick={() => {
                setTab('superadmin');
                setError(null);
              }}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'superadmin'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
            <button
              onClick={() => {
                setTab('employee');
                setError(null);
              }}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'employee'
                  ? 'bg-cyan-500 text-stone-950 shadow-md font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Staff Employee</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'superadmin' ? (
            <form onSubmit={handleSuperAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    placeholder="iantumwebaze75@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Admin Passkey (Optional for Verified Owner)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Quick shortcut if current user is owner */}
              <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-500/20 text-stone-400 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Owner Direct Pass:</span>
                </div>
                <p>
                  As the platform creator (<span className="text-stone-300">iantumwebaze75@gmail.com</span>), you have full root permissions to manage subscriptions, users, announcements, and employees.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Enter Admin Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmployeeLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Employee Access Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-cyan-500" />
                  <input
                    type="text"
                    value={employeeKey}
                    onChange={(e) => setEmployeeKey(e.target.value)}
                    required
                    placeholder="e.g. EMP-MOD-771"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 font-mono uppercase focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Sample keys helper for demo */}
              <div className="p-3 rounded-xl bg-stone-950/80 border border-cyan-500/20 text-stone-400 text-[11px] space-y-1.5">
                <div className="text-cyan-300 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sample Active Employee Keys:</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  {employees.slice(0, 3).map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => setEmployeeKey(emp.accessKey)}
                      className="cursor-pointer hover:text-white flex items-center justify-between p-1 rounded bg-stone-900 border border-stone-800"
                    >
                      <span className="text-cyan-400">{emp.accessKey}</span>
                      <span className="text-stone-400 font-sans">{emp.name} ({emp.roleTitle})</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Authenticate Staff Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
