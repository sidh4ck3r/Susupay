"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideTrendingUp, LucideLoader, LucidePlus, LucideLayoutGrid, LucideLogOut } from "lucide-react";
import CreateGoalModal from "@/components/CreateGoalModal";
import NotificationBell from "@/components/NotificationBell";

export default function SavingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const { id } = JSON.parse(storedUser);
    
    try {
      const [profileRes, savingsRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/profile/${id}`),
        axios.get(`${API_BASE_URL}/api/savings/${id}`),
        axios.get(`${API_BASE_URL}/api/transactions/history/${id}`)
      ]);
      setUser(profileRes.data);
      setGoals(savingsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Savings fetch error:", err);
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
              Savings <span className="text-emerald-500">Portfolio</span>
            </h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">
              Secure Asset Tracking <span className="text-emerald-500 opacity-50 ml-2">• Operational</span>
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

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-[0] mt-10">
        {/* Action Card: Create New Goal */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="glass-card p-8 border-dashed border-emerald-500/30 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center space-y-4 min-h-[280px] shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <LucidePlus size={32} strokeWidth={3} />
          </div>
          <div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">New Savings Goal</h4>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Initialize your next target</p>
          </div>
        </div>

        {goals.map((goal: any) => (
          <div key={goal.id} className="glass-card p-8 glow-border group hover:border-emerald-500/30 transition-all shadow-2xl flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                  <LucideTrendingUp className="text-emerald-400" size={24} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Completion</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                  </span>
                </div>
              </div>
              <h4 className="text-2xl font-black mb-6 text-white uppercase tracking-tight leading-tight">{goal.title}</h4>
            </div>

            <div className="space-y-6">
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%` }}
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Current</p>
                  <p className="text-sm font-bold text-white font-mono">₵{goal.currentAmount}</p>
                </div>
                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</p>
                  <p className="text-sm font-bold text-slate-300 font-mono">₵{goal.targetAmount}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateGoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
        userId={user?.id}
      />
    </div>
  );
}
