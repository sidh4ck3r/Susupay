"use client";
import { useState, useEffect } from "react";
import { LucideBell, LucideCheckCircle, LucideInfo, LucideLogOut, LucideLoader } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import NotificationBell from "@/components/NotificationBell";

export default function NotificationsPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const { id } = JSON.parse(storedUser);
    try {
      const historyRes = await axios.get(`${API_BASE_URL}/api/transactions/history/${id}`);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Notifications/History fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const notifications = history.slice(0, 10).map(trx => ({
    id: trx.id,
    title: trx.status === 'SUCCESS' ? 'Deposit Confirmed' : 'Transaction Update',
    description: `Transaction of ₵${trx.amount} via ${trx.reference.slice(0, 8)}... has been logged.`,
    type: trx.status === 'SUCCESS' ? 'SUCCESS' : 'INFO',
    time: new Date(trx.createdAt).toLocaleTimeString(),
    link: '/dashboard/transactions'
  }));

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-emerald-500 bg-[#0a0f1a]">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-6 lg:p-10 space-y-10 text-slate-100 relative isolate">
      {/* Decorative Background Element - Subtle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      {/* Sticky Header Hub */}
      <div className="sticky top-0 z-[500] -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 mb-4 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <header className="flex justify-between items-center max-w-7xl mx-auto w-full pl-16 lg:pl-0 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic tracking-[0.1em]">
               System <span className="text-emerald-500">Alerts</span>
            </h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">
               Operational Pulse <span className="text-emerald-500 opacity-50 ml-2">• Secure</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
               <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <NotificationBell notifications={notifications.slice(0, 5)} />
             </div>
             
             <button 
               onClick={() => {
                 localStorage.removeItem("susupay_user");
                 localStorage.removeItem("susupay_token");
                 router.push("/auth");
               }}
               className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-red-500 hover:text-white hover:bg-red-500/20 transition-all border border-white/5 group shadow-lg"
               title="Terminate Session"
             >
               <LucideLogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
             </button>
          </div>
        </header>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-4 relative z-[0]">
        {notifications.map((n: any) => (
          <div 
            key={n.id} 
            onClick={() => n.link && router.push(n.link)}
            className="glass-card p-6 flex gap-4 hover:border-emerald-500/30 hover:bg-white/[0.02] cursor-pointer transition-all group active:scale-[0.99] shadow-xl"
          >
            <div className={`p-3 rounded-xl h-fit transition-transform group-hover:scale-110 ${
              n.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {n.type === 'SUCCESS' ? <LucideCheckCircle size={20} /> : <LucideInfo size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-black text-white group-hover:text-emerald-400 transition-colors uppercase text-xs tracking-tight tracking-widest">{n.title}</h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{n.time}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{n.description}</p>
              {n.link && (
                <div className="mt-3 flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Audit Transaction</span>
                  <LucideBell size={10} />
                </div>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="glass-card p-20 text-center border-dashed border-white/10 animate-in zoom-in duration-500">
            <LucideBell size={48} className="text-slate-800 mx-auto mb-4 opacity-50" />
            <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-xs">No notifications found in protocol</p>
          </div>
        )}
      </div>
    </div>
  );
}
