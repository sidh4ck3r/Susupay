"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideHistory, LucideLoader, LucideLogOut } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function TransactionsPage() {
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
      const res = await axios.get(`${API_BASE_URL}/api/transactions/history/${id}`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
               History <span className="text-emerald-500">Pulse</span>
            </h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">
               Protocol Logs <span className="text-emerald-500 opacity-50 ml-2">• Immutable</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
               <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <NotificationBell notifications={history.slice(0, 5).map(trx => ({
                 id: trx.id,
                 title: trx.status === 'SUCCESS' ? 'Deposit Received' : 'Transaction Alert',
                 description: `₵${trx.amount} deposited via ${trx.reference.slice(0, 8)}...`,
                 type: trx.status === 'SUCCESS' ? 'SUCCESS' : 'INFO',
                 time: new Date(trx.createdAt).toLocaleTimeString(),
                 link: '/dashboard/transactions'
               }))} />
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

      <div className="max-w-7xl mx-auto w-full relative z-[0] mt-10">
        <div className="glass-card overflow-hidden shadow-2xl border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Transaction Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-5">System Reference</th>
                <th className="px-6 py-5">Transfer Status</th>
                <th className="px-6 py-5">Net Volume</th>
                <th className="px-6 py-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length > 0 ? history.map((trx: any) => (
                <tr key={trx.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-5 font-mono text-[11px] font-bold text-slate-400 group-hover:text-emerald-400 select-all tracking-tighter">{trx.reference}</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg active:scale-95 transition-transform border border-emerald-500/10">
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-mono font-black text-white text-lg italic tracking-tight">₵{trx.amount}</td>
                  <td className="px-6 py-5 text-[10px] text-slate-500 uppercase font-black tracking-widest">{new Date(trx.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-600 italic text-xs uppercase font-black tracking-widest opacity-50">No activity logs found in protocol</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}
