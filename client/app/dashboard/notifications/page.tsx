"use client";
import { LucideBell, LucideCheckCircle, LucideClock, LucideInfo } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Welcome to SusuPay",
      description: "Your account is now active. Start saving for your future today!",
      type: "SUCCESS",
      time: "Just now",
      link: "/dashboard"
    },
    {
      id: 2,
      title: "KYC Pending",
      description: "Please complete your identity verification to unlock higher limits.",
      type: "INFO",
      time: "2 hours ago",
      link: "/dashboard"
    }
  ];

  const router = useRouter();

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a]">
      <header className="max-w-4xl mx-auto w-full pt-12 pb-10">
        <div className="flex items-center gap-3 mb-2">
          <LucideBell className="text-emerald-500" size={24} />
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">
            Notifications
          </h1>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Stay updated with your account activity.
        </p>
      </header>

      <div className="max-w-4xl mx-auto w-full space-y-4">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            onClick={() => n.link && router.push(n.link)}
            className="glass-card p-6 flex gap-4 hover:border-emerald-500/30 hover:bg-white/[0.02] cursor-pointer transition-all group active:scale-[0.99]"
          >
            <div className={`p-3 rounded-xl h-fit transition-transform group-hover:scale-110 ${
              n.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {n.type === 'SUCCESS' ? <LucideCheckCircle size={20} /> : <LucideInfo size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase text-xs tracking-tight">{n.title}</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{n.time}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{n.description}</p>
              {n.link && (
                <div className="mt-3 flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Take Action</span>
                  <LucideBell size={10} />
                </div>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="glass-card p-12 text-center border-dashed border-white/10">
            <LucideBell size={48} className="text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 italic text-sm">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
