"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import MomoDeposit from "@/components/MomoDeposit";
import CreateGoalModal from "@/components/CreateGoalModal";
import WithdrawalModal from "@/components/WithdrawalModal";
import NotificationBell from "@/components/NotificationBell";
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
    <div className="min-h-screen bg-[#0a0f1a] p-6 lg:p-10 space-y-10 text-slate-100">
      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full pl-16 lg:pl-0 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-slate-400 text-sm font-medium">Your SusuPay vault is secure and growing.</p>
        </div>
        <div className="flex items-center gap-4">
           <NotificationBell notifications={history.slice(0, 5).map(trx => ({
             id: trx.id,
             title: trx.status === 'SUCCESS' ? 'Deposit Received' : 'Transaction Alert',
             description: `₵${trx.amount} deposited via ${trx.reference.slice(0, 8)}...`,
             type: trx.status === 'SUCCESS' ? 'SUCCESS' : 'INFO',
             time: new Date(trx.createdAt).toLocaleTimeString(),
             link: '/transactions'
           }))} />
           
           <button 
             onClick={() => {
               localStorage.removeItem("susupay_user");
               localStorage.removeItem("susupay_token");
               router.push("/auth");
             }}
             className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/10 group"
             title="Sign Out"
           >
             <LucideLogOut size={18} className="group-hover:translate-x-1 transition-transform" />
             <span className="hidden sm:inline">Sign Out</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Stats & Analytics */}
        <div className="lg:col-span-2 space-y-8">
           {/* Top Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-8 bg-gradient-to-br from-emerald-600/10 via-transparent to-transparent relative overflow-hidden group hover:border-emerald-500/30 transition-all cursor-default shadow-2xl">
                <div className="relative z-10 flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-emerald-400 text-[10px] font-black tracking-[0.2em] uppercase">Total Balance</p>
                    <h2 className="text-5xl font-black tracking-tighter font-mono text-white">₵{user?.balance || "0.00"}</h2>
                  </div>
                  <div className="p-4 glass-card bg-emerald-500/5 border-emerald-500/10 rounded-2xl">
                    <LucideWallet className="text-emerald-500" size={32} />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">KYC {user?.kycStatus}</div>
                  <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider">Level 1 Wallet</div>
                </div>
              </div>

              <div className="glass-card p-8 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent relative overflow-hidden group hover:border-blue-500/30 transition-all cursor-default shadow-2xl">
                <div className="relative z-10 flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase">Active Goals</p>
                    <h2 className="text-5xl font-black tracking-tighter font-mono text-white">{goals.length}</h2>
                  </div>
                  <div className="p-4 glass-card bg-blue-500/5 border-blue-500/10 rounded-2xl">
                    <LucideTrendingUp className="text-blue-500" size={32} />
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target: ₵{goals.reduce((acc, g) => acc + parseFloat(g.targetAmount), 0).toFixed(2)}</p>
                </div>
              </div>
           </div>

           {/* Analytics Chart */}
           <div className="glass-card p-6 border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <LucideTrendingUp className="text-emerald-500" size={20} />
                  <h3 className="font-bold">Growth Momentum</h3>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded">Last 7 Deposits</span>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `₵${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Withdrawal Requests Hub */}
           <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <LucideArrowUpRight className="text-red-500" size={20} />
                  <h3 className="font-bold">Payout Status</h3>
                </div>
                <div className="flex gap-3 items-center">
                  <button 
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-white/5"
                  >
                    <LucideArrowUpRight size={14} />
                    New Withdrawal
                  </button>
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1.5 rounded border border-yellow-500/20">
                    {withdrawals.filter(w => w.status === 'PENDING').length} Pending
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {withdrawals.length > 0 ? withdrawals.map((w: any) => (
                      <tr key={w.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{w.momoProvider}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{w.momoNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white">₵{w.amount}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {w.status === 'PENDING' ? <LucideClock size={12} className="text-yellow-500" /> : 
                             w.status === 'APPROVED' ? <LucideCheckCircle size={12} className="text-emerald-500" /> : 
                             <LucideXCircle size={12} className="text-red-500" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              w.status === 'APPROVED' ? 'text-emerald-500' : 
                              w.status === 'PENDING' ? 'text-yellow-500' : 
                              'text-red-400'
                            }`}>{w.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-slate-500 uppercase font-bold">{new Date(w.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic text-sm">No payout requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>

           {/* History Table */}
           <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <LucideHistory className="text-emerald-500" size={20} />
                  <h3 className="font-bold">Deposit History</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.length > 0 ? history.map((trx: any) => (
                      <tr key={trx.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400 group-hover:text-emerald-400">{trx.reference}</td>
                        <td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">{trx.status}</td>
                        <td className="px-6 py-4 font-mono font-bold text-white">₵{trx.amount}</td>
                        <td className="px-6 py-4 text-[10px] text-slate-500 uppercase font-bold">{new Date(trx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic text-sm">No transactions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        {/* Right Column: Side Actions */}
        <div className="lg:col-span-1">
           <div className="sticky top-10 space-y-6">
              <MomoDeposit onSuccess={fetchData} />

              {/* Group Susu Circles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <LucideUsers size={16} className="text-emerald-500" />
                    Susu Circles
                  </h3>
                  <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">Join New</button>
                </div>
                
                {groups.length > 0 ? groups.map((group: any) => (
                  <div key={group.id} className="glass-card p-5 border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent hover:border-blue-500/20 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <LucideLayoutGrid size={20} />
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                        group.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {group.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{group.name}</h4>
                    <p className="text-[10px] text-slate-500 mb-4 line-clamp-1">{group.description}</p>
                    
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-400 uppercase tracking-widest">Contr: ₵{group.contributionAmount}</span>
                      <span className="text-blue-400 font-black">{group.frequency}</span>
                    </div>
                  </div>
                )) : (
                  <div className="glass-card p-6 border-dashed border-white/10 text-center">
                    <p className="text-[10px] text-slate-500 italic uppercase font-black tracking-widest">No Active Circles</p>
                    <button className="mt-3 text-[10px] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg font-bold transition-all">Browse Groups</button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-1 pt-4 border-t border-white/5">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <LucideTrendingUp size={16} className="text-emerald-500" />
                  Personal Goals
                </h3>
              </div>
              
              {goals.length > 0 ? goals.map((goal: any) => (
                <div key={goal.id} className="glass-card p-6 glow-border group hover:border-emerald-500/20 transition-all cursor-pointer">
                  <LucideTrendingUp className="text-emerald-400 mb-4" size={24} />
                  <h4 className="font-bold mb-1">{goal.title}</h4>
                  <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target: ₵{goal.targetAmount}</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                      </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                        style={{ width: `${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%` }}
                      />
                  </div>
                </div>
              )) : (
                <div className="glass-card p-6 border-dashed border-white/10 text-center">
                  <p className="text-xs text-slate-500 italic">No savings goals yet.</p>
                </div>
              )}
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
    </div>
  );
}
