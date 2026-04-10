"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideTrendingUp, LucideLoader, LucidePlus } from "lucide-react";
import CreateGoalModal from "@/components/CreateGoalModal";

export default function SavingsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = async () => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const { id } = JSON.parse(storedUser);
    setUserId(id);
    try {
      const savingsRes = await axios.get(`${API_BASE_URL}/api/savings/${id}`);
      setGoals(savingsRes.data);
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
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      {/* Decorative Background Element - Subtle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-[100] flex flex-col items-center justify-center text-center pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <LucideTrendingUp className="text-emerald-500" size={20} />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase tracking-wider">
            Savings Portfolio
          </h1>
        </div>
        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80">
          Real-time tracking of financial targets
        </p>
      </header>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mt-10">
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
        userId={userId}
      />
    </div>
  );
}
