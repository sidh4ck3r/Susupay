"use client";
import { LucideClock, LucideCheckCircle, LucideXCircle, LucideInfo } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'SUCCESS' | 'PENDING' | 'ERROR' | 'INFO';
  time: string;
  link?: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  readIds?: string[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export default function NotificationDropdown({ 
  notifications, 
  isOpen, 
  onClose,
  readIds = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {} 
}: NotificationDropdownProps) {
  const router = useRouter();
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-80 glass-card bg-[#0f172a] border border-white/10 shadow-2xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="font-bold text-sm">System Alerts</h3>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
            {unreadCount} New
          </span>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => {
                const isRead = readIds.includes(n.id);
                return (
                  <div 
                    key={n.id} 
                    onClick={() => {
                      onMarkAsRead(n.id);
                      if (n.link) {
                        router.push(n.link);
                      }
                      onClose();
                    }}
                    className={`p-4 transition-all cursor-pointer group border-l-2 ${isRead ? 'opacity-60 bg-transparent border-transparent' : 'bg-emerald-500/[0.03] hover:bg-emerald-500/[0.05] border-emerald-500'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 ${
                        n.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                        n.type === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                        n.type === 'ERROR' ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {n.type === 'SUCCESS' && <LucideCheckCircle size={14} />}
                        {n.type === 'PENDING' && <LucideClock size={14} />}
                        {n.type === 'ERROR' && <LucideXCircle size={14} />}
                        {n.type === 'INFO' && <LucideInfo size={14} />}
                      </div>
                      <div className="space-y-1">
                        <p className={`text-xs font-bold transition-colors ${isRead ? 'text-slate-300' : 'text-white group-hover:text-emerald-400'}`}>{n.title}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{n.description}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">{n.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center">
              <LucideInfo size={32} className="mx-auto text-slate-700 mb-3" />
              <p className="text-xs text-slate-500 italic">No new notifications</p>
            </div>
          )}
        </div>
        
        {unreadCount > 0 && (
          <div className="p-3 border-t border-white/5 bg-white/[0.01] text-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onMarkAllAsRead();
              }}
              className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors p-2"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
}
