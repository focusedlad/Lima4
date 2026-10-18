import React, { useState } from 'react';
import {
  Shield,
  Users,
  Radio,
  Bell,
  CreditCard,
  Settings,
  UserPlus,
  Crown,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  DollarSign,
  Lock,
  Unlock,
  Trash2,
  Edit3,
  Plus,
  Send,
  RefreshCw,
  LogOut,
  ChevronRight,
  ExternalLink,
  Sliders,
  Clock,
  Briefcase,
  Layers,
  ArrowUpRight,
  Activity,
  Check,
  Zap,
} from 'lucide-react';
import {
  UserProfile,
  StudySpace,
  SubscriptionPlan,
  GlobalAnnouncement,
  EmployeeAccount,
  EmployeePermission,
  SystemSettings,
} from '../../types';

interface AdminDashboardProps {
  currentAdmin: {
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'employee';
    employeeId?: string;
    permissions: string[];
  };
  onExitAdmin: () => void;
  users: UserProfile[];
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
  spaces: StudySpace[];
  onUpdateSpaces: (updatedSpaces: StudySpace[]) => void;
  plans: SubscriptionPlan[];
  onUpdatePlans: (updatedPlans: SubscriptionPlan[]) => void;
  announcements: GlobalAnnouncement[];
  onUpdateAnnouncements: (updatedAnnouncements: GlobalAnnouncement[]) => void;
  employees: EmployeeAccount[];
  onUpdateEmployees: (updatedEmployees: EmployeeAccount[]) => void;
  settings: SystemSettings;
  onUpdateSettings: (updatedSettings: SystemSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentAdmin,
  onExitAdmin,
  users,
  onUpdateUsers,
  spaces,
  onUpdateSpaces,
  plans,
  onUpdatePlans,
  announcements,
  onUpdateAnnouncements,
  employees,
  onUpdateEmployees,
  settings,
  onUpdateSettings,
}) => {
  // Navigation sub-tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'spaces' | 'announcements' | 'subscriptions' | 'settings' | 'team'
  >('overview');

  // Simulation mode for testing employee view
  const [simulatedEmployeeId, setSimulatedEmployeeId] = useState<string | null>(null);

  // Active permissions determined by superadmin or simulated employee
  const activeEmployee = simulatedEmployeeId
    ? employees.find((e) => e.id === simulatedEmployeeId)
    : null;

  const currentPermissions =
    activeEmployee
      ? activeEmployee.permissions
      : currentAdmin.role === 'superadmin'
      ? (['overview', 'users', 'spaces', 'announcements', 'subscriptions', 'settings', 'team'] as EmployeePermission[])
      : (currentAdmin.permissions as EmployeePermission[]);

  const hasPerm = (perm: EmployeePermission) => currentPermissions.includes(perm);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ----------------------------------------------------
  // USER MANAGEMENT STATE
  // ----------------------------------------------------
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userTierFilter, setUserTierFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.university || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.countryName || '').toLowerCase().includes(userSearch.toLowerCase());

    const matchRole = userRoleFilter === 'all' || (u.role || 'student') === userRoleFilter;
    const matchTier = userTierFilter === 'all' || (u.subscriptionTier || 'free') === userTierFilter;

    return matchSearch && matchRole && matchTier;
  });

  const handleToggleSuspendUser = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextState = !u.isSuspended;
        showToast(nextState ? `User ${u.name} suspended.` : `User ${u.name} reinstated.`);
        return { ...u, isSuspended: nextState };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = users.map((u) => (u.id === editingUser.id ? editingUser : u));
    onUpdateUsers(updated);
    setEditingUser(null);
    showToast(`Updated user profile for ${editingUser.name}`);
  };

  // ----------------------------------------------------
  // STUDY SPACES OVERSIGHT STATE
  // ----------------------------------------------------
  const [spaceSearch, setSpaceSearch] = useState('');
  const [spaceFilter, setSpaceFilter] = useState<'all' | 'ghost' | 'public'>('all');

  const filteredSpaces = spaces.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(spaceSearch.toLowerCase()) ||
      s.subjectTag.toLowerCase().includes(spaceSearch.toLowerCase()) ||
      s.hostName.toLowerCase().includes(spaceSearch.toLowerCase());

    const matchType =
      spaceFilter === 'all' ||
      (spaceFilter === 'ghost' && s.isGhostMode) ||
      (spaceFilter === 'public' && !s.isGhostMode);

    return matchSearch && matchType;
  });

  const handleCloseSpace = (spaceId: string) => {
    const spaceToClose = spaces.find((s) => s.id === spaceId);
    const updated = spaces.filter((s) => s.id !== spaceId);
    onUpdateSpaces(updated);
    showToast(`Study space "${spaceToClose?.name}" closed by admin.`);
  };

  const handleToggleGhostSpace = (spaceId: string) => {
    const updated = spaces.map((s) => {
      if (s.id === spaceId) {
        const nextGhost = !s.isGhostMode;
        return { ...s, isGhostMode: nextGhost };
      }
      return s;
    });
    onUpdateSpaces(updated);
    showToast('Space visibility updated.');
  };

  // ----------------------------------------------------
  // ANNOUNCEMENTS STATE
  // ----------------------------------------------------
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<GlobalAnnouncement>>({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    isActive: true,
    actionLabel: '',
  });

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    const created: GlobalAnnouncement = {
      id: `ann_${Date.now()}`,
      title: newAnnouncement.title,
      message: newAnnouncement.message,
      type: newAnnouncement.type || 'info',
      priority: newAnnouncement.priority || 'normal',
      author: activeEmployee ? activeEmployee.name : currentAdmin.name,
      createdAt: new Date().toISOString(),
      isActive: true,
      actionLabel: newAnnouncement.actionLabel || undefined,
    };

    onUpdateAnnouncements([created, ...announcements]);
    setIsCreatingAnnouncement(false);
    setNewAnnouncement({ title: '', message: '', type: 'info', priority: 'normal', isActive: true });
    showToast('Global announcement broadcasted to all students!');
  };

  const handleToggleAnnouncementActive = (id: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
    onUpdateAnnouncements(updated);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    onUpdateAnnouncements(updated);
    showToast('Announcement deleted.');
  };

  // ----------------------------------------------------
  // SUBSCRIPTION PRICING ENGINE STATE
  // ----------------------------------------------------
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState(false);

  const handleSavePlan = (plan: SubscriptionPlan) => {
    const updated = plans.map((p) => (p.id === plan.id ? plan : p));
    onUpdatePlans(updated);
    setEditingPlan(null);
    showToast(`Updated pricing and perks for "${plan.name}".`);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    onUpdatePlans([...plans, editingPlan]);
    setIsCreatingNewPlan(false);
    setEditingPlan(null);
    showToast(`Created new plan "${editingPlan.name}".`);
  };

  // Calculate MRR (Monthly Recurring Revenue)
  const calculateMRR = () => {
    let mrr = 0;
    users.forEach((u) => {
      const tierId = u.subscriptionTier || 'free';
      const plan = plans.find((p) => p.id === tierId);
      if (plan && plan.monthlyPrice > 0) {
        mrr += plan.monthlyPrice;
      }
    });
    return mrr;
  };

  // ----------------------------------------------------
  // TEAM & EMPLOYEES (RBAC) STATE
  // ----------------------------------------------------
  const [isHiringEmployee, setIsHiringEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeAccount | null>(null);
  const [newEmpForm, setNewEmpForm] = useState({
    name: '',
    email: '',
    roleTitle: 'Study Space Moderator',
    permissions: ['overview', 'spaces', 'users'] as EmployeePermission[],
  });

  const handleHireEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.name || !newEmpForm.email) return;

    const accessCode = `EMP-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newEmployee: EmployeeAccount = {
      id: `emp_${Date.now()}`,
      name: newEmpForm.name,
      email: newEmpForm.email,
      roleTitle: newEmpForm.roleTitle,
      status: 'active',
      permissions: newEmpForm.permissions,
      accessKey: accessCode,
      hiredAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just invited',
    };

    onUpdateEmployees([...employees, newEmployee]);
    setIsHiringEmployee(false);
    setNewEmpForm({
      name: '',
      email: '',
      roleTitle: 'Study Space Moderator',
      permissions: ['overview', 'spaces', 'users'],
    });
    showToast(`Staff member ${newEmployee.name} hired with access key ${accessCode}!`);
  };

  const handleToggleEmpPermission = (perm: EmployeePermission) => {
    if (editingEmployee) {
      const perms = editingEmployee.permissions.includes(perm)
        ? editingEmployee.permissions.filter((p) => p !== perm)
        : [...editingEmployee.permissions, perm];
      setEditingEmployee({ ...editingEmployee, permissions: perms });
    } else {
      const perms = newEmpForm.permissions.includes(perm)
        ? newEmpForm.permissions.filter((p) => p !== perm)
        : [...newEmpForm.permissions, perm];
      setNewEmpForm({ ...newEmpForm, permissions: perms });
    }
  };

  const handleSaveEmployeeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const updated = employees.map((emp) => (emp.id === editingEmployee.id ? editingEmployee : emp));
    onUpdateEmployees(updated);
    setEditingEmployee(null);
    showToast(`Updated permissions for ${editingEmployee.name}`);
  };

  const handleToggleEmployeeStatus = (empId: string) => {
    const updated = employees.map((emp) => {
      if (emp.id === empId) {
        const nextStatus = emp.status === 'active' ? ('suspended' as const) : ('active' as const);
        return { ...emp, status: nextStatus };
      }
      return emp;
    });
    onUpdateEmployees(updated);
    showToast('Employee access status toggled.');
  };

  const handleRevokeEmployee = (empId: string) => {
    const updated = employees.filter((emp) => emp.id !== empId);
    onUpdateEmployees(updated);
    showToast('Employee access revoked.');
  };

  // ----------------------------------------------------
  // SYSTEM SETTINGS STATE
  // ----------------------------------------------------
  const [settingsForm, setSettingsForm] = useState<SystemSettings>({ ...settings });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    showToast('System configuration saved across the platform.');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-stone-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Bar */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 py-3 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 shadow-md">
              <Shield className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  Lumina Super Admin
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  {simulatedEmployeeId ? 'Simulating Employee' : currentAdmin.role}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  System 99.98%
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Logged in as <strong className="text-stone-300">{activeEmployee ? activeEmployee.name : currentAdmin.name}</strong> ({activeEmployee ? activeEmployee.email : currentAdmin.email})
              </p>
            </div>
          </div>

          {/* Quick Simulation Mode & Exit */}
          <div className="flex items-center gap-2.5">
            {currentAdmin.role === 'superadmin' && employees.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-stone-950 px-2.5 py-1.5 rounded-xl border border-stone-800">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-stone-400 text-[11px]">Preview View:</span>
                <select
                  value={simulatedEmployeeId || ''}
                  onChange={(e) => setSimulatedEmployeeId(e.target.value || null)}
                  className="bg-transparent text-white font-medium text-xs focus:outline-none"
                >
                  <option value="" className="bg-stone-900 text-amber-400">Owner (Full Root Access)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-stone-900 text-stone-200">
                      Staff: {emp.name} ({emp.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onExitAdmin}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Return to Campus</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {hasPerm('overview') && (
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview & KPIs</span>
            </button>
          )}

          {hasPerm('users') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {users.length}
              </span>
            </button>
          )}

          {hasPerm('spaces') && (
            <button
              onClick={() => setActiveTab('spaces')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'spaces'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Study Spaces Oversight</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {spaces.length}
              </span>
            </button>
          )}

          {hasPerm('announcements') && (
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'announcements'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Announcements</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {announcements.filter((a) => a.isActive).length} active
              </span>
            </button>
          )}

          {hasPerm('subscriptions') && (
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'subscriptions'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pricing & Subscriptions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/30 text-emerald-300">
                ${calculateMRR().toFixed(0)} MRR
              </span>
            </button>
          )}

          {hasPerm('team') && (
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'team'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Staff & RBAC</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {employees.length}
              </span>
            </button>
          )}

          {hasPerm('settings') && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>System Settings</span>
              {settings.maintenanceMode && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1">
        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW & KPIS                                      */}
        {/* ============================================================ */}
        {activeTab === 'overview' && hasPerm('overview') && (
          <div className="space-y-6 animate-fadeIn">
            {/* Dedicated Secret Admin Link Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-sm">
                      Dedicated Admin & Staff Access Link
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Hidden from Public Students
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                    The public Admin button is hidden from all student navigation. Admins and authorized employees use this dedicated link to access the dashboard directly, or the discrete shortcut <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px] border border-stone-700">Ctrl+Shift+A</kbd>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-amber-300 truncate max-w-xs select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/#admin` : 'https://.../#admin'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/#admin`;
                    navigator.clipboard.writeText(url);
                    showToast('Admin direct link copied to clipboard!');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-md">
                <div className="flex items-center justify-between text-stone-400 text-xs font-medium mb-2">
                  <span>Total Students</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {users.length}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18% this month</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-md">
                <div className="flex items-center justify-between text-stone-400 text-xs font-medium mb-2">
                  <span>Active Study Spaces</span>
                  <Radio className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {spaces.length}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-400">
                  <span>{spaces.filter((s) => s.isGhostMode).length} in Ghost Mode</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-md">
                <div className="flex items-center justify-between text-stone-400 text-xs font-medium mb-2">
                  <span>Est. Monthly Revenue</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                  ${calculateMRR().toFixed(2)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>{users.filter((u) => u.subscriptionTier !== 'free').length} active paid tiers</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-md">
                <div className="flex items-center justify-between text-stone-400 text-xs font-medium mb-2">
                  <span>Total Hours Logged</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {users.reduce((acc, u) => acc + (u.totalHoursStudied || 0), 0).toFixed(0)} hrs
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-purple-400">
                  <span>Avg streak: {(users.reduce((acc, u) => acc + u.currentStreak, 0) / (users.length || 1)).toFixed(1)} days</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Platform Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-md lg:col-span-1 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Admin Quick Actions</span>
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('announcements');
                      setIsCreatingAnnouncement(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white text-xs font-medium transition-colors flex items-center justify-between border border-stone-700"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-cyan-400" />
                      Broadcast New Announcement
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('subscriptions');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white text-xs font-medium transition-colors flex items-center justify-between border border-stone-700"
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      Adjust Subscription Pricing
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('team');
                      setIsHiringEmployee(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white text-xs font-medium transition-colors flex items-center justify-between border border-stone-700"
                  >
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                      Invite Staff / Moderator
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </button>

                  <button
                    onClick={() => {
                      const nextMaint = !settings.maintenanceMode;
                      onUpdateSettings({ ...settings, maintenanceMode: nextMaint });
                      showToast(nextMaint ? 'Emergency maintenance mode activated!' : 'Maintenance mode deactivated.');
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between border ${
                      settings.maintenanceMode
                        ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                        : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      {settings.maintenanceMode ? 'Deactivate Maintenance' : 'Toggle Maintenance Mode'}
                    </span>
                    <span className="text-[10px] uppercase font-bold">
                      {settings.maintenanceMode ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* System Audit Log */}
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-md lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Audit & Activity Log</span>
                  </h3>
                  <span className="text-[11px] text-stone-500 font-mono">auto-synced</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Database & Rules Deployed</p>
                        <p className="text-stone-400 text-[11px]">Firestore rules compiled and synchronized for project ai-studio-luminastudy.</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-500">2 mins ago</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 mt-0.5">
                        <Crown className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Subscription Engine Initialized</p>
                        <p className="text-stone-400 text-[11px]">Configured Free Scholar, Pro Academic, and Campus Elite tiers.</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-500">10 mins ago</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 mt-0.5">
                        <Users className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Global University Campus Active</p>
                        <p className="text-stone-400 text-[11px]">Makerere, Oxford, Tokyo Tech, and Harvard study floors online.</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-500">25 mins ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: USER DIRECTORY                                       */}
        {/* ============================================================ */}
        {activeTab === 'users' && hasPerm('users') && (
          <div className="space-y-5 animate-fadeIn">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search students by name, email, university, country..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="moderator">Moderators</option>
                  <option value="employee">Employees</option>
                  <option value="superadmin">Super Admins</option>
                </select>

                <select
                  value={userTierFilter}
                  onChange={(e) => setUserTierFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free Scholar</option>
                  <option value="pro">Pro Academic</option>
                  <option value="campus_elite">Campus Elite</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">University & Location</th>
                      <th className="py-3 px-4">Tier & Role</th>
                      <th className="py-3 px-4">Streak & XP</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {filteredUsers.map((u) => {
                      const tier = plans.find((p) => p.id === u.subscriptionTier);
                      return (
                        <tr key={u.id} className="hover:bg-stone-850/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover border border-stone-700"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1">
                                  <span>{u.name}</span>
                                  {u.isGhostMode && (
                                    <span title="Ghost Mode Active">
                                      <EyeOff className="w-3 h-3 text-purple-400" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-400">{u.email || `${u.id}@campus.local`}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span>{u.countryFlag || '🌐'}</span>
                              <span className="text-stone-300 font-medium">
                                {u.university || u.universityOrLocation || 'Global'}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 truncate max-w-[180px]">
                              {u.studyField || 'General Studies'}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.subscriptionTier === 'campus_elite'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : u.subscriptionTier === 'pro'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-stone-800 text-stone-400'
                                }`}
                              >
                                {tier?.name || 'Free Scholar'}
                              </span>
                              <div className="text-[10px] text-stone-500 uppercase font-semibold">
                                {u.role || 'student'}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-amber-400 font-bold">
                                <Flame className="w-3.5 h-3.5" />
                                <span>{u.currentStreak}d</span>
                              </div>
                              <div className="flex items-center gap-1 text-cyan-400 font-bold">
                                <Award className="w-3.5 h-3.5" />
                                <span>{u.xp} XP</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {u.isSuspended ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Active
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                                title="Edit User Profile & Perks"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleSuspendUser(u.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  u.isSuspended
                                    ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300'
                                    : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300'
                                }`}
                                title={u.isSuspended ? 'Unban User' : 'Suspend / Ban User'}
                              >
                                {u.isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm">
                <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span>Edit Student: {editingUser.name}</span>
                    </h3>
                    <button onClick={() => setEditingUser(null)} className="text-stone-400 hover:text-white">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Subscription Tier</label>
                        <select
                          value={editingUser.subscriptionTier || 'free'}
                          onChange={(e) => setEditingUser({ ...editingUser, subscriptionTier: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.monthlyPrice}/mo)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Platform Role</label>
                        <select
                          value={editingUser.role || 'student'}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                        >
                          <option value="student">Student</option>
                          <option value="moderator">Moderator</option>
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Streak (Days)</label>
                        <input
                          type="number"
                          value={editingUser.currentStreak}
                          onChange={(e) => setEditingUser({ ...editingUser, currentStreak: parseInt(e.target.value, 10) || 0 })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Focus XP</label>
                        <input
                          type="number"
                          value={editingUser.xp}
                          onChange={(e) => setEditingUser({ ...editingUser, xp: parseInt(e.target.value, 10) || 0 })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">University</label>
                      <input
                        type="text"
                        value={editingUser.university || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, university: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="userGhostToggle"
                        checked={editingUser.isGhostMode}
                        onChange={(e) => setEditingUser({ ...editingUser, isGhostMode: e.target.checked })}
                        className="rounded accent-purple-500"
                      />
                      <label htmlFor="userGhostToggle" className="text-stone-300 font-medium">
                        Force Ghost Mode (Incognito active session)
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400"
                      >
                        Save Student Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: STUDY SPACES OVERSIGHT                                */}
        {/* ============================================================ */}
        {activeTab === 'spaces' && hasPerm('spaces') && (
          <div className="space-y-5 animate-fadeIn">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
                <input
                  type="text"
                  value={spaceSearch}
                  onChange={(e) => setSpaceSearch(e.target.value)}
                  placeholder="Search rooms by name, subject tag, or host..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpaceFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    spaceFilter === 'all' ? 'bg-amber-500 text-stone-950' : 'bg-stone-950 text-stone-400'
                  }`}
                >
                  All ({spaces.length})
                </button>
                <button
                  onClick={() => setSpaceFilter('ghost')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                    spaceFilter === 'ghost' ? 'bg-purple-500 text-stone-950' : 'bg-stone-950 text-stone-400'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ghost Mode ({spaces.filter((s) => s.isGhostMode).length})</span>
                </button>
                <button
                  onClick={() => setSpaceFilter('public')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    spaceFilter === 'public' ? 'bg-emerald-500 text-stone-950' : 'bg-stone-950 text-stone-400'
                  }`}
                >
                  Public ({spaces.filter((s) => !s.isGhostMode).length})
                </button>
              </div>
            </div>

            {/* Spaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpaces.map((s) => (
                <div
                  key={s.id}
                  className={`p-5 rounded-2xl bg-stone-900 border transition-all ${
                    s.isGhostMode
                      ? 'border-purple-500/40 shadow-lg shadow-purple-950/20'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {s.isGhostMode && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 flex items-center gap-0.5">
                            <EyeOff className="w-2.5 h-2.5" /> Ghost
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-stone-400">{s.tagline}</p>
                    </div>
                  </div>

                  <div className="my-3 p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="text-stone-500">Host:</span>
                      <span className="font-semibold text-white">{s.hostName}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="text-stone-500">Subject:</span>
                      <span className="font-mono text-cyan-400 text-[11px]">{s.subjectTag}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="text-stone-500">Occupancy:</span>
                      <span className="font-semibold text-white">{s.currentMembers.length} / {s.maxCapacity}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="text-stone-500">Mode:</span>
                      <span className="capitalize font-medium text-emerald-400">{s.mode}</span>
                    </div>
                  </div>

                  {/* Room Moderation Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800">
                    <button
                      onClick={() => handleToggleGhostSpace(s.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {s.isGhostMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{s.isGhostMode ? 'Make Public' : 'Set Ghost'}</span>
                    </button>

                    <button
                      onClick={() => handleCloseSpace(s.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-medium flex items-center gap-1 transition-colors border border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Close Room</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ANNOUNCEMENTS & BROADCAST                            */}
        {/* ============================================================ */}
        {activeTab === 'announcements' && hasPerm('announcements') && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>Global Announcement Center</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Broadcast real-time ticker banners, maintenance notices, and exam cram events across all student screens.
                </p>
              </div>

              <button
                onClick={() => setIsCreatingAnnouncement(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Broadcast</span>
              </button>
            </div>

            {/* Create Announcement Modal / Form */}
            {isCreatingAnnouncement && (
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span>Compose Global Announcement</span>
                  </h4>
                  <button onClick={() => setIsCreatingAnnouncement(false)} className="text-stone-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Headline / Title</label>
                    <input
                      type="text"
                      required
                      value={newAnnouncement.title || ''}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      placeholder="e.g. 🌟 Global Exam Cram Week: 2x XP Boost Active!"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Message Body</label>
                    <textarea
                      required
                      rows={2}
                      value={newAnnouncement.message || ''}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                      placeholder="e.g. All focus sessions completed this week earn double experience points and level up your desk pet twice as fast."
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">Alert Category</label>
                      <select
                        value={newAnnouncement.type || 'info'}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                      >
                        <option value="info">Info / News</option>
                        <option value="event">Event / Bonus</option>
                        <option value="alert">Important Alert</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="update">Platform Update</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">Priority Level</label>
                      <select
                        value={newAnnouncement.priority || 'normal'}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                      >
                        <option value="normal">Normal Banner</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent / Red Alert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">Action Button Text (Optional)</label>
                      <input
                        type="text"
                        value={newAnnouncement.actionLabel || ''}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, actionLabel: e.target.value })}
                        placeholder="e.g. Join Sprint, Read More"
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingAnnouncement(false)}
                      className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                    >
                      Publish Announcement
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Announcements */}
            <div className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-2xl bg-stone-900 border transition-all flex items-start justify-between gap-4 ${
                    a.isActive ? 'border-stone-800' : 'border-stone-850 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          a.type === 'event'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : a.type === 'maintenance' || a.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {a.type}
                      </span>
                      <h4 className="font-bold text-white text-sm">{a.title}</h4>
                      {a.isActive ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-semibold">Paused</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-300">{a.message}</p>
                    <div className="text-[11px] text-stone-500 flex items-center gap-3 pt-1">
                      <span>Author: {a.author}</span>
                      <span>Created: {new Date(a.createdAt).toLocaleDateString()}</span>
                      {a.actionLabel && <span>Button: "{a.actionLabel}"</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleAnnouncementActive(a.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        a.isActive
                          ? 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                          : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300'
                      }`}
                    >
                      {a.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: PRICING & SUBSCRIPTION ENGINE                         */}
        {/* ============================================================ */}
        {activeTab === 'subscriptions' && hasPerm('subscriptions') && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Subscription Engine & Pricing Control</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Control how much students pay, toggle active membership plans, and edit what features and services each tier unlocks.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPlan({
                    id: `plan_custom_${Date.now()}`,
                    name: 'Cohort Pass',
                    tagline: 'Custom subscription package for student study groups.',
                    monthlyPrice: 14.99,
                    yearlyPrice: 139.99,
                    badge: 'Custom',
                    isPopular: false,
                    isActive: true,
                    features: ['Private cohort room access', 'Unlimited Flashcards', 'Socratic AI Tutor'],
                    limits: {
                      magicImportsPerDay: 20,
                      canCreatePrivateRooms: true,
                      canUseGhostMode: true,
                      hasPriorityTutor: true,
                      unlimitedDecks: true,
                      maxMembersInRoom: 30,
                    },
                  });
                  setIsCreatingNewPlan(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Plan</span>
              </button>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl bg-stone-900 border flex flex-col justify-between transition-all ${
                    plan.isPopular
                      ? 'border-emerald-500/50 shadow-xl shadow-emerald-950/20'
                      : 'border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                      {plan.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${plan.badgeColor || 'bg-stone-800 text-stone-300'}`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 min-h-[32px]">{plan.tagline}</p>

                    {/* Pricing Display */}
                    <div className="my-4 p-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-stone-500 uppercase font-semibold">Monthly</div>
                        <div className="text-xl font-extrabold text-white">
                          ${plan.monthlyPrice.toFixed(2)}/mo
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-stone-500 uppercase font-semibold">Annual</div>
                        <div className="text-xl font-extrabold text-emerald-400">
                          ${plan.yearlyPrice.toFixed(2)}/yr
                        </div>
                      </div>
                    </div>

                    {/* Limits Box */}
                    <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-850 space-y-1.5 text-xs text-stone-300 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">AI Imports:</span>
                        <span className="font-semibold text-white">
                          {plan.limits.magicImportsPerDay === -1 ? 'Unlimited' : `${plan.limits.magicImportsPerDay}/day`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Ghost Mode:</span>
                        <span className="font-semibold">
                          {plan.limits.canUseGhostMode ? 'Allowed' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Private Rooms:</span>
                        <span className="font-semibold">
                          {plan.limits.canCreatePrivateRooms ? 'Allowed' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Max Room Members:</span>
                        <span className="font-semibold text-white">
                          {plan.limits.maxMembersInRoom} studiers
                        </span>
                      </div>
                    </div>

                    {/* Perks List */}
                    <div className="space-y-1.5 mb-5">
                      <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                        Feature Perks ({plan.features.length})
                      </div>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-stone-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPlan({ ...plan });
                        setIsCreatingNewPlan(false);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Price & Perks</span>
                    </button>

                    <button
                      onClick={() => {
                        const updated = plans.map((p) =>
                          p.id === plan.id ? { ...p, isActive: !p.isActive } : p
                        );
                        onUpdatePlans(updated);
                        showToast(`Plan ${plan.name} status toggled.`);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                        plan.isActive
                          ? 'bg-stone-800 text-emerald-400'
                          : 'bg-stone-850 text-stone-500'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Plan Modal */}
            {editingPlan && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm">
                <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>
                        {isCreatingNewPlan ? 'Create Subscription Plan' : `Edit Plan: ${editingPlan.name}`}
                      </span>
                    </h3>
                    <button onClick={() => setEditingPlan(null)} className="text-stone-400 hover:text-white">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      if (isCreatingNewPlan) {
                        handleCreatePlan(e);
                      } else {
                        e.preventDefault();
                        handleSavePlan(editingPlan);
                      }
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Plan Name</label>
                        <input
                          type="text"
                          required
                          value={editingPlan.name}
                          onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={editingPlan.badge || ''}
                          onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                          placeholder="e.g. Most Popular, Institutional"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-semibold mb-1">Tagline / Subtitle</label>
                      <input
                        type="text"
                        value={editingPlan.tagline}
                        onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                      />
                    </div>

                    {/* Pricing Inputs */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-stone-950 border border-stone-800">
                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">
                          Monthly Price (USD $)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingPlan.monthlyPrice}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, monthlyPrice: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white font-bold text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-300 font-semibold mb-1">
                          Yearly Price (USD $)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingPlan.yearlyPrice}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, yearlyPrice: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white font-bold text-sm"
                        />
                      </div>
                    </div>

                    {/* Limits & Feature Gates */}
                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                      <h5 className="font-bold text-white text-xs">Feature Gates & Service Limits</h5>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-400 mb-1">AI Magic Imports/day (-1 for unlimited)</label>
                          <input
                            type="number"
                            value={editingPlan.limits.magicImportsPerDay}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                limits: {
                                  ...editingPlan.limits,
                                  magicImportsPerDay: parseInt(e.target.value, 10) || 0,
                                },
                              })
                            }
                            className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-400 mb-1">Max Room Members Capacity</label>
                          <input
                            type="number"
                            value={editingPlan.limits.maxMembersInRoom}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                limits: {
                                  ...editingPlan.limits,
                                  maxMembersInRoom: parseInt(e.target.value, 10) || 8,
                                },
                              })
                            }
                            className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPlan.limits.canCreatePrivateRooms}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                limits: { ...editingPlan.limits, canCreatePrivateRooms: e.target.checked },
                              })
                            }
                            className="rounded accent-emerald-500"
                          />
                          <span>Allow Private & Locked Rooms</span>
                        </label>

                        <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPlan.limits.canUseGhostMode}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                limits: { ...editingPlan.limits, canUseGhostMode: e.target.checked },
                              })
                            }
                            className="rounded accent-emerald-500"
                          />
                          <span>Allow Ghost Mode (Incognito)</span>
                        </label>

                        <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPlan.limits.hasPriorityTutor}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                limits: { ...editingPlan.limits, hasPriorityTutor: e.target.checked },
                              })
                            }
                            className="rounded accent-emerald-500"
                          />
                          <span>Priority Socratic AI Tutor</span>
                        </label>

                        <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPlan.isPopular}
                            onChange={(e) =>
                              setEditingPlan({ ...editingPlan, isPopular: e.target.checked })
                            }
                            className="rounded accent-emerald-500"
                          />
                          <span>Highlight as "Most Popular"</span>
                        </label>
                      </div>
                    </div>

                    {/* Features List Editor */}
                    <div className="space-y-2">
                      <label className="block text-stone-300 font-semibold">Included Perks & Benefits</label>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {editingPlan.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-stone-950 border border-stone-850 text-stone-200"
                          >
                            <span className="truncate">{feat}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFeats = editingPlan.features.filter((_, i) => i !== idx);
                                setEditingPlan({ ...editingPlan, features: newFeats });
                              }}
                              className="text-stone-500 hover:text-rose-400 p-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newFeatureText}
                          onChange={(e) => setNewFeatureText(e.target.value)}
                          placeholder="Add new perk (e.g. 4K synchronized stream)..."
                          className="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newFeatureText.trim()) return;
                            setEditingPlan({
                              ...editingPlan,
                              features: [...editingPlan.features, newFeatureText.trim()],
                            });
                            setNewFeatureText('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
                        >
                          Add Perk
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => setEditingPlan(null)}
                        className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold"
                      >
                        {isCreatingNewPlan ? 'Create Subscription Tier' : 'Save Plan Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: STAFF & EMPLOYEES (RBAC)                              */}
        {/* ============================================================ */}
        {activeTab === 'team' && hasPerm('team') && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  <span>Employee Access & Role-Based Permissions (RBAC)</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Employ team members, issue unique access keys, and restrict exactly which features each employee can see and operate.
                </p>
              </div>

              <button
                onClick={() => setIsHiringEmployee(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Hire Staff Member</span>
              </button>
            </div>

            {/* Employee Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className={`p-5 rounded-2xl bg-stone-900 border flex flex-col justify-between transition-all ${
                    emp.status === 'suspended' ? 'border-rose-900/60 opacity-60' : 'border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                        <p className="text-[11px] text-amber-400 font-medium">{emp.roleTitle}</p>
                        <p className="text-[11px] text-stone-400">{emp.email}</p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </div>

                    {/* Access Key Display */}
                    <div className="my-3 p-2.5 rounded-xl bg-stone-950 border border-stone-850 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-500 text-[10px] uppercase">Access Key:</span>
                      <span className="text-cyan-400 font-bold">{emp.accessKey}</span>
                    </div>

                    {/* Permissions Badges */}
                    <div className="space-y-1 mb-4">
                      <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        Authorized Permissions ({emp.permissions.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {emp.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-800 text-stone-300"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-stone-500">
                      Hired: {emp.hiredAt} • Last active: {emp.lastActive}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-2 mt-4">
                    <button
                      onClick={() => setEditingEmployee({ ...emp })}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Access</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleEmployeeStatus(emp.id)}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                          emp.status === 'active'
                            ? 'bg-stone-850 hover:bg-stone-800 text-stone-400'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                        title={emp.status === 'active' ? 'Suspend Employee' : 'Activate Employee'}
                      >
                        {emp.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleRevokeEmployee(emp.id)}
                        className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 transition-colors"
                        title="Revoke and Remove Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hire / Edit Employee Modal */}
            {(isHiringEmployee || editingEmployee) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm">
                <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-amber-400" />
                      <span>{isHiringEmployee ? 'Hire New Staff Member' : `Edit Permissions: ${editingEmployee?.name}`}</span>
                    </h3>
                    <button
                      onClick={() => {
                        setIsHiringEmployee(false);
                        setEditingEmployee(null);
                      }}
                      className="text-stone-400 hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={isHiringEmployee ? handleHireEmployee : handleSaveEmployeeEdit}
                    className="space-y-4 text-xs"
                  >
                    {isHiringEmployee ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-300 font-semibold mb-1">Full Name</label>
                            <input
                              type="text"
                              required
                              value={newEmpForm.name}
                              onChange={(e) => setNewEmpForm({ ...newEmpForm, name: e.target.value })}
                              placeholder="e.g. Rachel Adams"
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-stone-300 font-semibold mb-1">Work Email</label>
                            <input
                              type="email"
                              required
                              value={newEmpForm.email}
                              onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                              placeholder="rachel@lumina.study"
                              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-stone-300 font-semibold mb-1">Job Role Title</label>
                          <input
                            type="text"
                            required
                            value={newEmpForm.roleTitle}
                            onChange={(e) => setNewEmpForm({ ...newEmpForm, roleTitle: e.target.value })}
                            placeholder="e.g. Lead Campus Moderator, Billing Specialist"
                            className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                        <div className="font-bold text-white text-sm">{editingEmployee?.name}</div>
                        <div className="text-stone-400">{editingEmployee?.email} • {editingEmployee?.roleTitle}</div>
                        <div className="mt-1 font-mono text-[11px] text-cyan-400">Access Key: {editingEmployee?.accessKey}</div>
                      </div>
                    )}

                    {/* Permissions Checkbox Grid */}
                    <div className="space-y-2">
                      <label className="block text-stone-300 font-semibold">
                        Granted Feature Permissions
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-stone-950 border border-stone-850">
                        {[
                          { key: 'overview', label: 'System Overview & Financial KPIs' },
                          { key: 'users', label: 'User Directory (Edit, Suspend, XP)' },
                          { key: 'spaces', label: 'Study Spaces Moderation & Ghost View' },
                          { key: 'announcements', label: 'Global Announcements Broadcast' },
                          { key: 'subscriptions', label: 'Subscriptions & Pricing Engine' },
                          { key: 'settings', label: 'System Settings & Maintenance Mode' },
                        ].map((permItem) => {
                          const isChecked = editingEmployee
                            ? editingEmployee.permissions.includes(permItem.key as EmployeePermission)
                            : newEmpForm.permissions.includes(permItem.key as EmployeePermission);

                          return (
                            <label
                              key={permItem.key}
                              className="flex items-start gap-2 p-1.5 rounded hover:bg-stone-900 cursor-pointer text-stone-300"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleEmpPermission(permItem.key as EmployeePermission)}
                                className="mt-0.5 rounded accent-amber-500"
                              />
                              <span className="text-[11px] font-medium leading-tight">
                                {permItem.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsHiringEmployee(false);
                          setEditingEmployee(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                      >
                        {isHiringEmployee ? 'Issue Employee Credentials' : 'Save Employee Permissions'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: SYSTEM SETTINGS                                       */}
        {/* ============================================================ */}
        {activeTab === 'settings' && hasPerm('settings') && (
          <div className="max-w-3xl space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Global System Configuration & Controls</span>
              </h3>
              <p className="text-xs text-stone-400">
                Configure platform defaults, global multipliers, maintenance status, and quotas.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-md space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Platform Brand Name</label>
                  <input
                    type="text"
                    value={settingsForm.platformName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, platformName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Super Admin Email</label>
                  <input
                    type="email"
                    value={settingsForm.superAdminEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, superAdminEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Platform Tagline</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              {/* Maintenance Toggle */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Platform Maintenance Mode</span>
                    </h5>
                    <p className="text-[11px] text-stone-400">
                      When enabled, a maintenance banner locks non-admin students from launching new sessions.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.maintenanceMode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                    className="w-5 h-5 rounded accent-rose-500"
                  />
                </div>

                {settingsForm.maintenanceMode && (
                  <div>
                    <label className="block text-stone-400 mb-1">Student Lockout Notice</label>
                    <input
                      type="text"
                      value={settingsForm.maintenanceNotice}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceNotice: e.target.value })}
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-white"
                    />
                  </div>
                )}
              </div>

              {/* Gamification & Timer Defaults */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-stone-950 border border-stone-850">
                <div>
                  <label className="block text-stone-400 mb-1">Global XP Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={settingsForm.xpMultiplier}
                    onChange={(e) => setSettingsForm({ ...settingsForm, xpMultiplier: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Default Pomodoro Work (min)</label>
                  <input
                    type="number"
                    value={settingsForm.defaultPomodoroWork}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultPomodoroWork: parseInt(e.target.value, 10) || 25 })}
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Default Break (min)</label>
                  <input
                    type="number"
                    value={settingsForm.defaultPomodoroBreak}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultPomodoroBreak: parseInt(e.target.value, 10) || 5 })}
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Platform Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
