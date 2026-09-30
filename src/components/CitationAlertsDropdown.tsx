import React, { useRef, useEffect } from 'react';
import { Bell, TrendingUp, CheckCheck, Trash2, ArrowUpRight, X } from 'lucide-react';
import type { CitationAlert } from '../types/citationMonitor.ts';

interface CitationAlertsDropdownProps {
  alerts: CitationAlert[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAlerts: () => void;
  onSelectAlert: (alert: CitationAlert) => void;
  onOpenMonitor: () => void;
}

export const CitationAlertsDropdown: React.FC<CitationAlertsDropdownProps> = ({
  alerts,
  unreadCount,
  isOpen,
  onToggle,
  onClose,
  onMarkAllRead,
  onClearAlerts,
  onSelectAlert,
  onOpenMonitor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={onToggle}
        className={`relative rounded p-1.5 transition-colors cursor-pointer ${
          isOpen
            ? 'bg-neutral-800 text-neutral-100'
            : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
        }`}
        title={`Citation Monitor Alerts (${unreadCount} unread)`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-neutral-950 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-neutral-800 bg-neutral-950 p-0 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-850 px-4 py-3 bg-neutral-900/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-200">
                Citation Alerts
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono text-emerald-400">
                  ({unreadCount} new)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {alerts.length > 0 && (
                <>
                  <button
                    onClick={onMarkAllRead}
                    className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={onClearAlerts}
                    className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                    title="Clear all alerts"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1 text-neutral-500 hover:text-neutral-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-850/60">
            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-neutral-500 space-y-1">
                <Bell className="h-5 w-5 mx-auto text-neutral-700 mb-2" />
                <p className="text-neutral-400 font-medium">No citation alerts yet</p>
                <p className="text-[11px] text-neutral-600">
                  Track papers in the Citation Monitor. When new searches discover fresh citations, alerts will appear here.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    onSelectAlert(alert);
                    onClose();
                  }}
                  className={`p-3 text-xs transition-colors hover:bg-neutral-900/50 cursor-pointer ${
                    !alert.read ? 'bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-emerald-400 font-medium">
                          +{alert.delta} new {alert.delta === 1 ? 'citation' : 'citations'}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(alert.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-neutral-200 line-clamp-1 font-medium">
                        {alert.paperTitle}
                      </p>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
                        <span>
                          Count: {alert.previousCount} → <span className="text-neutral-300 font-mono font-medium">{alert.newCount}</span>
                        </span>
                        {alert.searchTopic && (
                          <span className="truncate max-w-[120px] text-neutral-500">
                            via {alert.searchTopic}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          <div className="border-t border-neutral-850 px-4 py-2.5 bg-neutral-950 text-center">
            <button
              onClick={() => {
                onOpenMonitor();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Open Citation Monitor</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
