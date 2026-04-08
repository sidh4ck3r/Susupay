"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { 
  LucideTrendingUp, 
  LucideHistory, 
  LucideLoader,
  LucideArrowLeft,
  LucideSmartphone,
  LucideBarChart3
} from "lucide-react";
import Link from "next/link";

export default function CollectorPerformanceHub() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState<any>({ totalCollected: 0, count: 0 });

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return false;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return false;
    const user = JSON.parse(storedUser);
    return user.role === 'COLLECTOR' || user.role === 'ADMIN';
  };

  const fetchPerformance = async () => {
    const token = localStorage.getItem("susupay_token");
    const storedUser = localStorage.getItem("susupay_user");
    if (!token || !storedUser) return;
    const user = JSON.parse(storedUser);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`${API_BASE_URL}/api/collector/daily/${user.id}`, config);
      setHistory(res.data);
      
      const totalAmount = res.data.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
      setStats({ totalCollected: totalAmount, count: res.data.length });
    } catch (err: any) {
      console.error("Collector performance hub fetch error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthorized(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (checkAuthStatus()) {
      setIsAuthorized(true);
      fetchPerformance();
    } else {
      router.push("/collector");
    }
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-emerald-500">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.01] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center justify-between pt-12 pb-10 pl-16 lg:pl-0">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <Link href="/collector" className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors text-xs font-black uppercase tracking-widest mb-4 group">
            <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Terminal
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase tracking-[0.15em]">
            Performance Hub
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Operational Analytics & Daily History</p>
        </div>

        <div className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-4 py-2 rounded-lg border border-blue-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="glass-card p-8 border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.03] to-transparent shadow-xl">
             <div className="flex flex-col items-center text-center">
                <LucideBarChart3 className="text-emerald-500 mb-4" size={32} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Daily Collections</p>
                <h3 className="text-3xl font-bold font-mono tracking-tight text-white uppercase">₵{stats.totalCollected.toFixed(2)}</h3>
             </div>
          </div>
          <div className="glass-card p-8 border-blue-500/10 bg-gradient-to-br from-blue-500/[0.03] to-transparent shadow-xl">
             <div className="flex flex-col items-center text-center">
                <LucideSmartphone className="text-blue-400 mb-4" size={32} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Synced Cash Entries</p>
                <h3 className="text-3xl font-bold font-mono tracking-tight text-white uppercase">{stats.count} Records</h3>
             </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden shadow-2xl border-white/5 bg-white/[0.01]">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-bold flex items-center gap-3">
              <LucideHistory size={20} className="text-slate-400" />
              Daily Entry Logs
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Transaction Ref</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Time Entry</th>
                  <th className="px-6 py-4 text-center">Receipt Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length > 0 ? history.map((trx) => (
                  <tr key={trx.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500 uppercase">#{trx.reference.split('-')[1]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-white">{trx.User?.fullName || "Uncategorized"}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">₵{parseFloat(trx.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-slate-400">
                         {new Date(trx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider">Synced & Validated</span>
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic text-sm">No transaction records found for this operational cycle.</td>
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
