import React, { useState } from 'react';
import {
  X,
  Scale,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Lock,
  UserX,
  CheckCircle2,
  FileText,
  Radio,
  Timer,
  Youtube,
  Crown,
  Check,
} from 'lucide-react';

interface RulesAndFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  hasAccepted: boolean;
}

export const RulesAndFeaturesModal: React.FC<RulesAndFeaturesModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  hasAccepted,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'features' | 'liability'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-stone-900">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border-b border-stone-800 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight text-white">
                  Rules, Regulations & Feature Terms
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Legal Policy v2.4
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Official User Agreement, Community Standards, & Platform Protection Policy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rules and regulations"
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 bg-stone-100 p-1 border-b border-stone-200 text-xs font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rules'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1. Rules & Conduct</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'features'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>2. App Features</span>
          </button>
          <button
            onClick={() => setActiveTab('liability')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'liability'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'hover:text-stone-900'
            }`}
          >
            <Scale className="w-4 h-4 text-rose-600" />
            <span>3. Legal Protection</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-[13px] leading-relaxed text-stone-700 max-h-[60vh]">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                  <strong>Zero-Tolerance Notice:</strong> Lumina Study is an inclusive, distraction-free global learning environment. Any violation of these community rules will result in immediate permanent account suspension, ban of associated IP addresses, and forfeiture of active memberships.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-extrabold text-stone-900 flex items-center gap-2 mb-1.5">
                    <UserX className="w-4 h-4 text-rose-600" />
                    <span>1.1 Anti-Harassment & Civil Conduct</span>
                  </h4>
                  <p className="text-stone-600">
                    No studier may engage in bullying, cyberstalking, hate speech, sexual harassment, racial slurs, political aggression, or abusive communications within any study space, video room, text chat, or public activity feed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-extrabold text-stone-900 flex items-center gap-2 mb-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>1.2 Academic Integrity & Anti-Cheating Protocol</span>
                  </h4>
                  <p className="text-stone-600">
                    Lumina Study spaces and Gizmo AI tools must <strong>never</strong> be used to facilitate live test cheating, unauthorized distribution of copyrighted university examinations, or violations of your home university's academic honor code. All focus sprints and flashcards are for honest study.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-extrabold text-stone-900 flex items-center gap-2 mb-1.5">
                    <Lock className="w-4 h-4 text-purple-600" />
                    <span>1.3 Privacy, Recording & Ghost Mode Rights</span>
                  </h4>
                  <p className="text-stone-600">
                    Studiers retain full privacy rights. <strong>Recording, taking screenshots of peers' camera feeds, or broadcasting private study room audio without explicit written consent from all participants is strictly unlawful.</strong> Any studier can enable <em>Ghost Mode</em> at any time to remove their identity and study sessions from public directories.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-extrabold text-stone-900 flex items-center gap-2 mb-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>1.4 Authentic Identity & Account Security</span>
                  </h4>
                  <p className="text-stone-600">
                    You agree to provide accurate information regarding your name, university affiliation, and country. Impersonation of educators, university officials, Lumina staff, or other students is grounds for immediate expulsion. You are responsible for maintaining the confidentiality of your credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                  <strong>Overview of Platform Services:</strong> By accepting, you understand how each feature in Lumina Study functions and agree to use them solely for lawful, productive educational purposes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                    <Radio className="w-4 h-4 text-amber-600" />
                    <span>World Campus & Rooms</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Real-time virtual campus rooms where students study together using WebRTC presence, silent focus timers, and knock-to-enter admission queues.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Gizmo AI & Flashcards</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    AI-powered syllabus and textbook flashcard generator. Flashcards are educational study aids; users are responsible for verifying syllabus accuracy.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                    <Timer className="w-4 h-4 text-emerald-600" />
                    <span>Focus Timers & Desk Pets</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Customizable Pomodoro, Deep Work, and Flowtime sprints. Focus minutes unlock XP to evolve your virtual desk pet (Shiba, Capybara, Owl).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                    <Youtube className="w-4 h-4 text-rose-600" />
                    <span>YouTube Live Study Radar</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Integration with high-uptime live stream channels for synced focus ambiance. Embeds conform strictly to YouTube's public API policies.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 col-span-1 sm:col-span-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                    <Crown className="w-4 h-4 text-teal-600" />
                    <span>Subscription Memberships & Billing</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Includes <em>Free Scholar</em>, <em>Pro Academic</em> ($9.99/mo), and <em>Campus Elite</em> ($19.99/mo). Paid tiers unlock unlimited AI deck imports, priority admission, and cloud backups. Subscriptions can be self-cancelled anytime from your settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'liability' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
                <Scale className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                  <strong>Legal Notice & Lawsuit Waiver:</strong> This agreement constitutes a binding legal contract between you and Lumina Study (administered by founder Ian Tumwebaze). By checking accept, you waive specific legal remedies and agree to individual arbitration.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-extrabold text-stone-900 mb-1 text-xs sm:text-sm">
                    3.1 "As-Is" Service & No Academic Guarantees
                  </h4>
                  <p className="text-stone-600 text-xs">
                    Lumina Study is provided on an "AS-IS" and "AS-AVAILABLE" basis without warranties of any kind, whether express or implied. Lumina Study is a productivity and peer-focus tool; <strong>it does not guarantee any specific academic grades, exam passage rates, test scores, university admissions, or professional accreditation.</strong> The user assumes total responsibility for their academic performance.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-extrabold text-stone-900 mb-1 text-xs sm:text-sm">
                    3.2 Strict Limitation of Liability & Lawsuit Defense
                  </h4>
                  <p className="text-stone-600 text-xs">
                    To the maximum extent permitted by applicable law, in no event shall Lumina Study, its founder, officers, employees, agents, or licensors be liable for any direct, indirect, punitive, incidental, special, consequential, or exemplary damages, including but not limited to loss of data, exam failure, academic disciplinary action, service interruption, or device malfunction.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-extrabold text-stone-900 mb-1 text-xs sm:text-sm">
                    3.3 Indemnification by User
                  </h4>
                  <p className="text-stone-600 text-xs">
                    You agree to defend, indemnify, and hold harmless Lumina Study and its administrators from and against any and all claims, liabilities, damages, losses, expenses, or attorney fees arising out of your violation of these Rules, misconduct toward other users, or infringement of third-party copyright.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-extrabold text-stone-900 mb-1 text-xs sm:text-sm">
                    3.4 Mandatory Arbitration & Class Action Waiver
                  </h4>
                  <p className="text-stone-600 text-xs">
                    You and Lumina Study agree that any dispute, claim, or controversy shall be resolved exclusively through individual confidential binding arbitration rather than in court. <strong>You expressly waive any right to initiate, join, or participate in any class action lawsuit or representative action against Lumina Study.</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Binding agreement for all registered accounts and guests.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition-colors text-xs"
            >
              Close Window
            </button>
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{hasAccepted ? 'Terms Accepted ✓' : 'I Accept Rules & Terms'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
