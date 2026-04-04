"use client";

import { X, Bell, Check, Clock, ShieldCheck, Loader2, Hospital } from "lucide-react";

export interface DashboardNotification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DashboardNotification[];
  onMarkAllRead: () => void;
  isLoading: boolean;
}

export function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  isLoading,
}: NotificationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/20 flex items-center justify-center bg-white/5">
              <Bell className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Access Logs & Alerts</h2>
              <p className="text-xs text-white/40">
                Track hospital interaction with your digital medical records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={onMarkAllRead}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium bg-white/10 text-white hover:bg-white/20 transition-all uppercase tracking-widest border border-white/10 mr-2"
              >
                <Check className="w-3 h-3" />
                Clear Unread
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-black">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
              <p className="text-xs text-white/50 tracking-wide uppercase">
                Synchronizing Logs...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <ShieldCheck className="w-12 h-12 text-white/10" />
              <p className="text-sm font-bold text-white/60 tracking-wider">No Activity Detected</p>
              <p className="text-xs text-white/40 text-center max-w-xs">
                When hospitals access your permitted medical records, immutable access alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group relative flex items-start p-6 transition-colors ${
                    !notif.isRead
                      ? "bg-indigo-500/[0.03] hover:bg-indigo-500/[0.05]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="shrink-0 mt-1 mr-4">
                    <div className={`w-10 h-10 border flex items-center justify-center rounded-full ${
                      !notif.isRead 
                        ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-400 ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-black"
                        : "border-white/10 bg-white/5 text-white/40"
                    }`}>
                      <Hospital className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-sm mb-2 leading-relaxed ${!notif.isRead ? "text-white font-medium" : "text-white/60"}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-mono text-white/30">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/20" />
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <div className="shrink-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
