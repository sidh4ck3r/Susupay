"use client";
import { useEffect, useState } from "react";
import { LucideBell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'SUCCESS' | 'PENDING' | 'ERROR' | 'INFO';
  time: string;
  link?: string;
}

interface NotificationBellProps {
  notifications: Notification[];
}

export default function NotificationBell({ notifications }: NotificationBellProps) {
  const [animate, setAnimate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const [readIds, setReadIds] = useState<string[]>([]); // Track which notifications have been clicked/read

  // Filter out notifications that have already been marked as read
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  useEffect(() => {
    if (notifications.length > lastCount) {
      setHasUnread(true);
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 2000);
      return () => clearTimeout(timer);
    }
    setLastCount(notifications.length);
  }, [notifications.length, lastCount]);

  const handleToggle = () => {
    if (!isOpen) {
      setHasUnread(false);
      setAnimate(false);
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
  };

  return (
    <div className="relative z-[100]">
      <button 
        onClick={handleToggle}
        className={`w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all border border-white/5 ${animate && hasUnread && unreadCount > 0 ? 'animate-bounce text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''} ${isOpen ? 'text-emerald-400 bg-white/5' : ''}`}
      >
        <LucideBell size={20} />
      </button>
      
      {unreadCount > 0 && hasUnread && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0f1a] shadow-lg animate-in zoom-in-50 pointer-events-none">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      
      <NotificationDropdown 
        notifications={notifications} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        readIds={readIds}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
