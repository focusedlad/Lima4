import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Ghost,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { SubscriptionPlan, UserProfile } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  plans: SubscriptionPlan[];
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  plans,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePlans = plans.filter((p) => p.isActive);
  const currentTier = currentUser.subscriptionTier || 'free';

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (plan.id === currentTier) return;
    setProcessingPlanId(plan.id);
    setTimeout(() => {
      onSelectPlan(plan.id, billingCycle);
      setProcessingPlanId(null);
      setSuccessMessage(`🎉 Successfully upgraded to ${plan.name}! Your high-yield study perks are now active.`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1600);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-stone-850 to-stone-900 border-b border-stone-800 text-center relative">
          <button
            onClick={onClose}
            aria-label="Close subscription modal"
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lumina Academic Memberships</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Supercharge Your Study Velocity
          </h2>
          <p className="mt-2 text-stone-400 text-sm max-w-xl mx-auto">
            Choose the membership tier that fits your academic goals. Unlock unlimited AI Magic Imports, private study spaces, and incognito Ghost Mode.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex items-center p-1 bg-stone-950 rounded-xl border border-stone-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                Save ~25%
              </span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm text-center font-medium animate-fadeIn flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePlans.map((plan) => {
            const isCurrent = plan.id === currentTier;
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const pricePerMonth = billingCycle === 'yearly' && plan.yearlyPrice > 0 ? (plan.yearlyPrice / 12).toFixed(2) : null;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all border ${
                  plan.isPopular
                    ? 'bg-stone-850/90 border-emerald-500/50 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {plan.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${plan.badgeColor || 'bg-stone-800 text-stone-300'}`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 min-h-[32px]">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mt-4 mb-6 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      ${price === 0 ? '0' : price.toFixed(2)}
                    </span>
                    <span className="text-stone-400 text-xs">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                    {pricePerMonth && (
                      <span className="ml-1 text-[11px] text-emerald-400">
                        (~${pricePerMonth}/mo)
                      </span>
                    )}
                  </div>

                  {/* Limits Highlight */}
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 mb-5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        AI Magic Imports:
                      </span>
                      <span className="font-semibold text-white">
                        {plan.limits.magicImportsPerDay === -1 ? 'Unlimited' : `${plan.limits.magicImportsPerDay}/day`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <Ghost className="w-3.5 h-3.5 text-purple-400" />
                        Ghost Mode:
                      </span>
                      <span className="font-semibold">
                        {plan.limits.canUseGhostMode ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-stone-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Pro Only
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        Room Capacity:
                      </span>
                      <span className="font-semibold text-white">
                        {plan.limits.maxMembersInRoom} studiers
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 mb-6">
                    <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Included Perks
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button */}
                <button
                  disabled={isCurrent || processingPlanId === plan.id}
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-stone-800 text-stone-400 cursor-default border border-stone-700'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 hover:shadow-emerald-500/20'
                      : 'bg-white hover:bg-stone-100 text-stone-900'
                  }`}
                >
                  {processingPlanId === plan.id ? (
                    <span className="inline-block animate-pulse">Upgrading...</span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Plan
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      {plan.monthlyPrice === 0 ? 'Downgrade to Free' : 'Upgrade to ' + plan.name}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between flex-wrap gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure simulated checkout. Cancel, pause, or switch plans anytime without penalty.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-stone-500">Institutional discounts available for universities.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
