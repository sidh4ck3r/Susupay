"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import MomoDeposit from "@/components/MomoDeposit";
import CreateGoalModal from "@/components/CreateGoalModal";
import WithdrawalModal from "@/components/WithdrawalModal";
import NotificationBell from "@/components/NotificationBell";
import KYCModal from "@/components/KYCModal";
import { LucideWallet, LucideTrendingUp, LucideHistory, LucideBell, LucideLoader, LucidePlus, LucideArrowUpRight, LucideCheckCircle, LucideClock, LucideXCircle, LucideUsers, LucideLayoutGrid, LucideLogOut } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);

  const fetchData = async () => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const { id } = JSON.parse(storedUser);

    try {
      const [profileRes, historyRes, goalsRes, withdrawalsRes, groupsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/profile/${id}`),
        axios.get(`${API_BASE_URL}/api/transactions/history/${id}`),
        axios.get(`${API_BASE_URL}/api/savings/${id}`),
        axios.get(`${API_BASE_URL}/api/transactions/withdrawals/${id}`),
        axios.get(`${API_BASE_URL}/api/groups/user/${id}`)
      ]);
      setUser(profileRes.data);
      setHistory(historyRes.data);
      setGoals(goalsRes.data);
      setWithdrawals(withdrawalsRes.data);
      setGroups(groupsRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");
      
      if (reference) {
         setIsLoading(true);
         axios.get(`${API_BASE_URL}/api/transactions/verify/${reference}`)
           .then(() => {
              alert("Payment Successful! Your deposit has been securely added to your vault.");
              window.history.replaceState({}, document.title, window.location.pathname);
              fetchData();
           })
           .catch((err) => {
              alert("Payment verification failed or was already processed.");
              window.history.replaceState({}, document.title, window.location.pathname);
              fetchData();
           });
         return; // fetchData will be called after verification
      }
    }
    
    fetchData();
  }, []);

  const chartData = history.slice(0, 7).reverse().map(trx => ({
    name: new Date(trx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    amount: parseFloat(trx.amount)
  }));

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-emerald-500">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-6 lg:p-10 space-y-10 text-slate-100 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[150px] -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full pl-16 lg:pl-0 relative z-[30]">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic tracking-[0.1em]">
            Vault <span className="text-emerald-500">Overview</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            System status: <span className="text-emerald-500/80 underline decoration-emerald-500/20 underline-offset-4">Operational</span>
          </p>
        </div>
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
           {(user?.role === 'ADMIN' || user?.role === 'AUDITOR' || user?.kycStatus === 'VERIFIED') && (
             <NotificationBell notifications={history.slice(0, 5).map(trx => ({
               id: trx.id,
               title: trx.status === 'SUCCESS' ? 'Deposit Received' : 'Transaction Alert',
               description: `₵${trx.amount} deposited via ${trx.reference.slice(0, 8)}...`,
               type: trx.status === 'SUCCESS' ? 'SUCCESS' : 'INFO',
               time: new Date(trx.createdAt).toLocaleTimeString(),
               link: '/dashboard/transactions'
             }))} />
           )}
           
           <button 
             onClick={() => {
               localStorage.removeItem("susupay_user");
               localStorage.removeItem("susupay_token");
               router.push("/auth");
             }}
             className="w-10 h-10 flex items-center justify-center rounded-xl text-red-500 hover:text-white hover:bg-red-500/20 transition-all border border-red-500/10 group shadow-lg shadow-red-500/5"
             title="Terminate Session"
           >
             <LucideLogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Left Column: Financial Pulse */}
        <div className="lg:col-span-8 space-y-8">
           {/* Primary Capital Card */}
           <div className="glass-card p-10 bg-gradient-to-br from-emerald-600/10 via-transparent to-transparent relative overflow-hidden group border-white/5 shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-emerald-400 text-[10px] font-black tracking-[0.25em] uppercase">Liquidity Profile</p>
                  </div>
                  <h2 className="text-6xl font-black tracking-tighter font-mono text-white leading-none">₵{user?.balance || "0.00"}</h2>
                  <div className="flex gap-3 pt-2">
                    <div className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider">Level 1 Authority</div>
                    <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-wider italic">ID: {user?.id?.slice(0, 8)}</div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                   <button 
                     onClick={() => router.push('/dashboard/deposit')}
                     className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group"
                   >
                     Deposit
                     <LucidePlus size={14} className="group-hover:rotate-90 transition-transform" />
                   </button>
                   <button 
                     onClick={() => setIsWithdrawModalOpen(true)}
                     className="flex-1 md:flex-none px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2 group"
                   >
                     Withdraw
                     <LucideArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                   </button>
                </div>
              </div>
           </div>

           {/* Analytics & Performance Hub */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Matrix */}
              <div 
                className="glass-card p-6 border-blue-500/10 bg-blue-500/[0.05] relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all shadow-2xl" 
                onClick={() => router.push('/dashboard/savings')}
              >
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/10 group-hover:scale-110 transition-transform">
                          <LucideTrendingUp size={20} />
                       </div>
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">Performance Matrix</h3>
                    </div>
                    <div className="space-y-4">
                       <div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                             <span>Target Achievement</span>
                             <span className="text-blue-400">
                               {goals.length > 0 ? (() => {
                                 const totalTarget = goals.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0);
                                 const totalCurrent = goals.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0);
                                 const percent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
                                 return `${percent}%`;
                               })() : "0%"}
                             </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                             <div 
                               className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                               style={{ width: goals.length > 0 ? `${Math.min(100, (goals.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0) / goals.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0)) * 100)}%` : '0%' }}
                             />
                          </div>
                       </div>
                    </div>
                    <button 
                      className="mt-6 text-[9px] font-black underline underline-offset-2 text-blue-400 hover:text-white uppercase tracking-widest flex items-center gap-1 group/btn transition-colors"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent double trigger
                        router.push('/dashboard/savings');
                      }}
                    >
                       View Detailed Analytics
                       <LucideArrowUpRight size={12} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/10 transition-all duration-700" />
              </div>

              <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-purple-600/[0.03] to-transparent">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recent Pulse</h3>
                    <Link href="/dashboard/transactions" className="text-[10px] font-black text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest underline underline-offset-4">Audit Logs</Link>
                 </div>
                 <div className="space-y-4">
                    {history.slice(0, 3).map(trx => (
                       <div key={trx.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {trx.type === 'DEPOSIT' ? <LucidePlus size={14} /> : <LucideArrowUpRight size={14} />}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-tight">{trx.type}</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase">{new Date(trx.createdAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <span className="text-xs font-black font-mono text-slate-200">₵{trx.amount}</span>
                       </div>
                    ))}
                    {history.length === 0 && (
                      <p className="text-[10px] text-slate-600 italic uppercase font-black text-center py-4">No recent activity detected</p>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Social Hub & Quick Ops */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card p-8 border-white/5 space-y-8 bg-white/[0.01]">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white flex items-center gap-3 mb-6">
                   <LucideUsers size={18} className="text-blue-500" />
                   Susu Circles
                </h3>
                <div className="space-y-4">
                   {groups.slice(0, 2).map(group => (
                      <div key={group.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 hover:border-blue-500/20 transition-all cursor-pointer group">
                         <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{group.name}</span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded italic">{group.status}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 font-bold">Contribution: ₵{group.contributionAmount}</span>
                            <span className="text-blue-400 font-black uppercase italic">{group.frequency}</span>
                         </div>
                      </div>
                   ))}
                   <button 
                     onClick={() => router.push('/dashboard/groups')}
                     className="w-full py-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] border border-dashed border-white/10 hover:border-white/30 rounded-2xl transition-all"
                   >
                     Enter Social Hub
                   </button>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center text-white/40">System Identity Verification</p>
                 <div className={`p-4 rounded-2xl border ${user?.kycStatus === 'VERIFIED' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : user?.kycStatus === 'PENDING' ? 'bg-blue-500/5 border-blue-500/10 text-blue-500' : user?.kycStatus === 'REJECTED' ? 'bg-red-500/5 border-red-500/10 text-red-500' : 'bg-yellow-500/5 border-yellow-500/10 text-yellow-500'} flex items-center justify-between transition-all`}>
                    <div className="flex items-center gap-3">
                       {user?.kycStatus === 'VERIFIED' ? <LucideCheckCircle size={16} /> : user?.kycStatus === 'REJECTED' ? <LucideXCircle size={16} /> : <LucideClock size={16} />}
                       <span className="text-[10px] font-black uppercase tracking-widest italic font-mono">{user?.kycStatus} Profile</span>
                    </div>
                    {(user?.kycStatus === 'UNVERIFIED' || user?.kycStatus === 'REJECTED') && (
                       <button 
                         onClick={() => setIsKYCModalOpen(true)}
                         className="text-[9px] font-black underline underline-offset-2 hover:text-white transition-colors"
                       >
                         {user?.kycStatus === 'REJECTED' ? "Update & Resubmit" : "Action Required"}
                       </button>
                    )}
                 </div>
                 
                 {user?.kycStatus === 'REJECTED' && user?.adminNote && (
                   <div className="mt-4 p-4 bg-red-500/[0.03] border border-red-500/10 rounded-xl animate-in slide-in-from-top-2">
                     <p className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500/60 mb-2">Rejection Reason</p>
                     <p className="text-xs text-slate-300 font-medium leading-relaxed italic">"{user.adminNote}"</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="glass-card p-6 border-emerald-500/10 bg-emerald-500/[0.05] relative overflow-hidden group cursor-pointer" onClick={() => router.push('/dashboard/deposit')}>
              <div className="relative z-10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <LucideHistory size={24} />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Instant Transaction</h4>
                    <p className="text-[10px] text-emerald-500/70 font-bold uppercase mt-0.5">Initialize secure MoMo conduit</p>
                 </div>
                 <LucidePlus className="ml-auto text-emerald-500 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={20} />
              </div>
           </div>
        </div>
      </div>

      <WithdrawalModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
        onSuccess={fetchData}
        userId={user?.id}
        balance={user?.balance || "0.00"}
      />

      <CreateGoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
        userId={user?.id}
      />

      <KYCModal 
        isOpen={isKYCModalOpen} 
        onClose={() => setIsKYCModalOpen(false)} 
        onSuccess={fetchData}
        userId={user?.id}
      />
    </div>
  );
}

