import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock } from 'lucide-react';

type LegalCenterProps = { onClose: () => void };

const sections = {
  terms: {
    title: 'Terms of Service',
    intro: 'These terms explain the conditions for using Lima4. By creating an account or using the service, you agree to these terms. If you do not agree, do not use Lima4.',
    groups: [
      ['1. About Lima4', 'Lima4 provides study timers, focus tracking, study rooms, community features, challenges, profiles and links to third-party learning or video services. Features may change as the product develops. Some features may be labelled beta or preview and may be unavailable or unreliable.'],
      ['2. Accounts and eligibility', 'You must provide accurate account information, keep your sign-in credentials secure and use an account you are authorised to control. You are responsible for activity carried out through your account. Tell us promptly if you suspect unauthorised access. We may require email verification and may restrict accounts used for fraud, abuse or security attacks.'],
      ['3. Acceptable use', 'Do not harass, threaten, impersonate, stalk, defraud or exploit other users; publish unlawful, hateful or sexually exploitative material; share another person’s private information without permission; spam or manipulate challenges; interfere with rooms or service availability; probe, scrape or reverse engineer the service except where applicable law permits; or upload malicious code.'],
      ['4. Community and user content', 'You retain responsibility for content you submit, including profile details, messages and challenge content. You must have the rights and permissions needed to submit it. You grant Lima4 a limited, non-exclusive permission to host, process and display that content as needed to operate the features and visibility settings you choose. You should not post confidential or sensitive information in public spaces.'],
      ['5. Study records and features', 'Timers, streaks, XP, leaderboards and analytics are productivity tools, not guarantees of academic results. Do not rely on them as the sole record of attendance, assessment or official academic performance. Keep independent records of important work.'],
      ['6. Third-party services', 'Lima4 may rely on providers such as Supabase, Vercel, Google/YouTube and device/browser services. Their services are governed by their own terms and privacy policies. Third-party availability, content, advertising and functionality are outside Lima4’s control. You must follow applicable third-party rules.'],
      ['7. Subscriptions and payments', 'If paid plans or payment processing are offered, the price, billing period, renewal, trial and cancellation terms will be shown before purchase. No payment should be considered due unless a clear checkout or payment instruction is presented. Refunds and statutory consumer rights are handled according to applicable law and the terms displayed at purchase.'],
      ['8. Availability, changes and termination', 'We aim to keep Lima4 available but do not promise uninterrupted or error-free service. We may maintain, modify, suspend or discontinue features for operational, safety or legal reasons. We may suspend or terminate access for serious or repeated violations, security risks or legal requirements. Where reasonably possible, we will provide notice.'],
      ['9. Disclaimers and liability', 'Lima4 is provided on an as-available basis. To the extent permitted by law, we disclaim implied warranties and are not responsible for indirect or consequential losses, loss of data caused by circumstances outside our reasonable control, or third-party services. Nothing in these terms excludes liability that cannot lawfully be excluded, including applicable consumer protections.'],
      ['10. Governing law and contact', 'These terms are intended to operate subject to the laws of Uganda and any mandatory laws that apply where you live. For questions or requests, use the support/contact method published within the Lima4 service. Do not send passwords or payment-card details in support messages.'],
      ['11. Updates', 'We may update these terms as Lima4 changes. The revision date below indicates the current published version. Material changes will be communicated through the service where reasonably practicable. Continued use after an update takes effect means you accept the updated terms, subject to applicable law.']
    ]
  },
  privacy: {
    title: 'Privacy Notice',
    intro: 'This notice describes the personal information Lima4 may process to provide and protect the service. The exact information depends on the features you use and the permissions you grant.',
    groups: [
      ['1. Information you provide', 'This may include your email address, account identifier, display name, username, avatar, banner, university or study details, profile description, settings, messages, friend and challenge activity, and support communications.'],
      ['2. Information created through use', 'Lima4 may process focus-session duration, dates, subjects and categories; streak and progress information; room presence and chat; notifications; challenge participation; and technical diagnostics needed to operate the service.'],
      ['3. Device and technical information', 'Our hosting, authentication and security providers may process IP address, browser/device information, request logs, timestamps, cookies or similar technologies, and diagnostic events for security, reliability and performance.'],
      ['4. How information is used', 'We use information to authenticate accounts; save profiles and study history; operate rooms, friends, feeds, challenges and notifications; provide settings and support; prevent fraud, abuse and security incidents; troubleshoot and improve performance; and comply with legal obligations.'],
      ['5. Visibility and sharing', 'Some information is private by default or controlled by profile/session visibility settings. Public profiles, public milestones, public challenges and room presence may be visible to other members as described in the feature. Friends-only content is intended for accepted friends. Review visibility settings before posting.'],
      ['6. Service providers and disclosures', 'Information may be processed by infrastructure and service providers that help deliver authentication, hosting, databases, analytics, video embeds, notifications and security. We do not sell personal information. We may disclose information where required by law, to protect users or the service, or as part of a legitimate business transfer subject to appropriate safeguards.'],
      ['7. Retention and deletion', 'We keep information for as long as needed to provide the service, meet legal obligations, resolve disputes and protect security. Retention periods may differ by data type and provider. Account deletion or a privacy request can be made through the support/contact method published in Lima4; some records may need to be retained where law permits or requires.'],
      ['8. Security', 'We use technical and organisational measures intended to protect information, including authenticated access controls and database permissions. No internet service can guarantee absolute security. Protect your credentials and report suspected account compromise promptly.'],
      ['9. Your choices and rights', 'Depending on applicable law, you may request access, correction, deletion, restriction or other handling of your personal information. You can manage profile visibility and certain account settings in Lima4. We may need to verify your identity before acting on a request.'],
      ['10. Children', 'Lima4 is designed for students and is not knowingly intended to collect personal information from children in circumstances where parental consent is legally required. If you believe a child has provided information improperly, contact us through the published support method.'],
      ['11. International processing and changes', 'Our providers may process information in countries other than Uganda. We take reasonable steps to use providers with appropriate safeguards. We may update this notice as the product or legal requirements change.']
    ]
  },
  policies: {
    title: 'Community & Platform Policies',
    intro: 'These rules apply to profiles, direct interactions, study rooms, public feeds, challenges and all other Lima4 community features.',
    groups: [
      ['Respectful conduct', 'Treat other members respectfully. Harassment, bullying, threats, hate-based abuse, sexual harassment, targeted humiliation and discriminatory conduct are prohibited.'],
      ['Identity and privacy', 'Do not impersonate another person, create deceptive accounts, expose private contact details, share private conversations without permission or attempt to access another member’s account.'],
      ['Room conduct', 'Use rooms for their stated study and community purpose. Do not flood chat, disrupt sessions, reserve seats deceptively, evade room restrictions or use voice/chat features to intimidate or harass others.'],
      ['Challenges and rankings', 'Participate honestly. Do not falsify study activity, exploit bugs, automate fake engagement, manipulate rankings or coordinate fraudulent participation.'],
      ['Content standards', 'Do not post unlawful material, malware, scams, spam, non-consensual intimate content, exploitative content or material that infringes another person’s intellectual property.'],
      ['Security and fair access', 'Do not attack, overload, scrape, reverse engineer or bypass access controls; do not test vulnerabilities against production without written authorisation. Report security concerns responsibly through the published support method.'],
      ['Moderation and enforcement', 'We may remove content, limit features, suspend sessions or restrict accounts when reasonably necessary to protect members, comply with law or enforce these policies. Enforcement may consider severity, repetition, evidence and risk. Users may contact support to request review of an action.'],
      ['Reporting', 'Report harmful content, suspicious behaviour, impersonation or security concerns through the support/contact method made available in Lima4. Include enough detail to locate the issue, but do not include passwords or sensitive personal data.']
    ]
  }
} as const;

export function LegalCenterModal({ onClose }: LegalCenterProps) {
  const [active, setActive] = useState<'terms' | 'privacy' | 'policies'>('terms');
  const current = sections[active];
  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm p-0 sm:p-5 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="legal-center-title">
      <section className="w-full max-w-4xl max-h-[94dvh] sm:max-h-[88vh] bg-white dark:bg-[#10131b] text-slate-900 dark:text-slate-100 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <header className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-wider"><ShieldCheck size={16}/> Lima4 Legal Centre</div>
            <h2 id="legal-center-title" className="text-2xl font-black mt-2">Your rights, safety & responsibilities</h2>
            <p className="text-xs text-slate-500 mt-1">Published 31 October 2026 · Version 2026.10</p>
          </div>
          <button onClick={onClose} aria-label="Close legal centre" className="rounded-xl px-3 py-2 bg-slate-100 dark:bg-white/10 text-sm font-semibold">Close</button>
        </header>
        <nav className="px-4 pt-3 flex gap-2 overflow-x-auto" aria-label="Legal documents">
          {([['terms','Terms'],['privacy','Privacy'],['policies','Platform Policies']] as const).map(([key,label]) => (
            <button key={key} onClick={() => setActive(key)} aria-pressed={active === key} className={'shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ' + (active === key ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300')}>
              {key === 'terms' ? <FileText className="inline w-4 h-4 mr-1.5"/> : key === 'privacy' ? <Lock className="inline w-4 h-4 mr-1.5"/> : <ShieldCheck className="inline w-4 h-4 mr-1.5"/>}{label}
            </button>
          ))}
        </nav>
        <div className="overflow-y-auto p-5 sm:p-7">
          <h3 className="text-xl font-extrabold mb-2">{current.title}</h3>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 mb-6">{current.intro}</p>
          <div className="space-y-6">
            {current.groups.map(([heading, body]) => <section key={heading}>
              <h4 className="font-bold text-sm mb-1.5">{heading}</h4>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
            </section>)}
          </div>
          <p className="mt-8 pt-4 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500">This page is a plain-language product notice, not legal advice. Please review it with qualified Ugandan counsel before relying on it as a final legal instrument.</p>
        </div>
        <footer className="p-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-3 text-sm">Done</button>
        </footer>
      </section>
    </div>
  );
}
