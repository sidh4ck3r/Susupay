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

  // Trigger alert logic when notifications change
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
      // Mark as read when opening
      setHasUnread(false);
      setAnimate(false);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button 
        onClick={handleToggle}
        className={`w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all border border-white/5 ${animate && hasUnread ? 'animate-bounce text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''} ${isOpen ? 'text-emerald-400 bg-white/5' : ''}`}
      >
        <LucideBell size={20} />
      </button>
      
      {notifications.length > 0 && hasUnread && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0f1a] shadow-lg animate-in zoom-in-50 pointer-events-none">
          {notifications.length > 9 ? '9+' : notifications.length}
        </span>
      )}
      
      <NotificationDropdown 
        notifications={notifications} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
}
