import React from 'react';
import { GlobalAnnouncement } from '../../types';
import {
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  Wrench,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AnnouncementBannerProps {
  announcement: GlobalAnnouncement | null;
  onDismiss: () => void;
  onActionClick?: (announcement: GlobalAnnouncement) => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcement,
  onDismiss,
  onActionClick,
}) => {
  if (!announcement || !announcement.isActive) return null;

  const getStyle = (type: GlobalAnnouncement['type'], priority: GlobalAnnouncement['priority']) => {
    if (priority === 'urgent' || type === 'maintenance') {
      return {
        bg: 'bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-rose-50 border-rose-700',
        icon: <ShieldAlert className="w-4 h-4 text-rose-300 animate-pulse" />,
        badge: 'bg-rose-500/20 text-rose-200 border border-rose-400/40',
        btn: 'bg-white text-rose-900 hover:bg-rose-100',
      };
    }
    if (type === 'alert') {
      return {
        bg: 'bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 text-amber-50 border-amber-700',
        icon: <AlertTriangle className="w-4 h-4 text-amber-300" />,
        badge: 'bg-amber-500/20 text-amber-200 border border-amber-400/40',
        btn: 'bg-amber-100 text-amber-950 hover:bg-white',
      };
    }
    if (type === 'event') {
      return {
        bg: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-emerald-50 border-emerald-700',
        icon: <Sparkles className="w-4 h-4 text-emerald-300" />,
        badge: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40',
        btn: 'bg-emerald-400 text-stone-950 hover:bg-emerald-300 font-semibold',
      };
    }
    // info or update
    return {
      bg: 'bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 border-stone-700',
      icon: <Info className="w-4 h-4 text-cyan-300" />,
      badge: 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40',
      btn: 'bg-cyan-400 text-stone-950 hover:bg-cyan-300 font-semibold',
    };
  };

  const style = getStyle(announcement.type, announcement.priority);

  return (
    <div
      className={`w-full py-2.5 px-4 border-b text-xs sm:text-sm shadow-md transition-all duration-300 ${style.bg}`}
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1 rounded-md bg-black/20 flex-shrink-0">
            {style.icon}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex-shrink-0 ${style.badge}`}>
            {announcement.type}
          </span>
          <p className="truncate font-medium flex-1">
            <strong className="font-semibold text-white mr-1.5">{announcement.title}:</strong>
            <span className="opacity-90">{announcement.message}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {announcement.actionLabel && (
            <button
              onClick={() => onActionClick && onActionClick(announcement)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-sm ${style.btn}`}
            >
              <span>{announcement.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onDismiss}
            aria-label="Dismiss announcement"
            className="p-1 rounded-md hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
