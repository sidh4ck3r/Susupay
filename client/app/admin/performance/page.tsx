"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { 
  LucideActivity, 
  LucideTrendingUp, 
  LucidePieChart, 
  LucideLoader,
  LucideArrowLeft,
  LucideArrowUpRight,
  LucideArrowDownRight,
  LucideShieldCheck
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

export default function AdminPerformanceHub() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return false;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return false;
    const user = JSON.parse(storedUser);
    return user.role === 'ADMIN' || user.role === 'AUDITOR';
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("susupay_token");
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const [analyticsRes, overviewRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/analytics`, config),
        axios.get(`${API_BASE_URL}/api/admin/overview`, config)
      ]);
      setAnalytics(analyticsRes.data);
      setOverview(overviewRes.data);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
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
      fetchAnalytics();
    } else {
      router.push("/admin");
    }
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-emerald-500">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  if (!isAuthorized) return null;

  // Transform volume data for the AreaChart
  const volumeByDate = analytics?.volumeData?.reduce((acc: any, item: any) => {
    const date = new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    if (!acc[date]) acc[date] = { name: date, Inflow: 0, Outflow: 0 };
    if (item.type === 'DEPOSIT') acc[date].Inflow += parseFloat(item.total);
    if (item.type === 'WITHDRAWAL') acc[date].Outflow += parseFloat(item.total);
    return acc;
  }, {});

  const chartData = volumeByDate ? Object.values(volumeByDate) : [];

  const kycData = analytics?.kycDistribution?.map((item: any) => ({
    name: item.kycStatus,
    value: parseInt(item.count)
  }));

  const providerData = analytics?.providerShare?.map((item: any) => ({
    name: item.provider,
    count: parseInt(item.count)
  }));

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-20 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.02] rounded-full blur-[150px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-10 pt-12 pb-10">
        <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors text-xs font-black uppercase tracking-widest mb-4 group w-fit">
          <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Command Center
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase tracking-[0.15em]">
              Performance <span className="text-emerald-500">Hub</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Operational Velocity & Network Insights</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full relative z-10 space-y-8">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-emerald-500/[0.02] to-transparent shadow-xl">
             <div className="flex justify-between items-start mb-4">
                <LucideActivity className="text-emerald-500" size={20} />
                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded italic">Real-time</span>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Liquidity</p>
             <h3 className="text-2xl font-bold font-mono text-white">₵ {overview?.totalLiquidity || "0.00"}</h3>
          </div>
          <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-blue-500/[0.02] to-transparent shadow-xl">
             <div className="flex justify-between items-start mb-4">
                <LucideTrendingUp className="text-blue-400" size={20} />
                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500"><LucideArrowUpRight size={10} /> +12%</span>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Protocol Volume</p>
             <h3 className="text-2xl font-bold font-mono text-white">₵ {chartData.reduce((acc: number, curr: any) => acc + (curr.Inflow || 0), 0).toFixed(2)}</h3>
          </div>
          <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-yellow-500/[0.02] to-transparent shadow-xl">
             <div className="flex justify-between items-start mb-4">
                <LucideShieldCheck className="text-yellow-400" size={20} />
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{overview?.pendingKYC} Actions</span>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compliance Health</p>
             <h3 className="text-2xl font-bold font-mono text-white">{Math.round(((overview?.totalUsers - (overview?.pendingKYC)) / overview?.totalUsers) * 100) || 0}%</h3>
          </div>
          <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-purple-500/[0.02] to-transparent shadow-xl">
             <div className="flex justify-between items-start mb-4">
                <LucidePieChart className="text-purple-400" size={20} />
                <span className="text-[9px] font-black bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">Network</span>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Users</p>
             <h3 className="text-2xl font-bold font-mono text-white">{overview?.totalUsers}</h3>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Liquidity Flow */}
           <div className="glass-card p-8 border-white/5 shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 border-b border-white/5 pb-4">Liquidity Velocity (7 Days)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} 
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                      itemStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}}
                    />
                    <Area type="monotone" dataKey="Inflow" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Outflow" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={3} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase'}} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Provider Share */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
              <div className="glass-card p-8 border-white/5 shadow-2xl flex flex-col items-center">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 border-b border-white/5 pb-4 w-full text-center">Protocol Adherence (KYC)</h3>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={kycData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {kycData?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{backgroundColor: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                        />
                        <Legend wrapperStyle={{fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase'}} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="glass-card p-8 border-white/5 shadow-2xl">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 border-b border-white/5 pb-4">Provider Market Share</h3>
                 <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={providerData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} 
                       />
                       <Tooltip 
                         cursor={{fill: 'rgba(255,255,255,0.02)'}}
                         contentStyle={{backgroundColor: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                       />
                       <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>
           </div>

        </div>

        {/* Detailed Insights Table (Mini) */}
        <div className="glass-card border-white/5 shadow-2xl overflow-hidden mt-10">
           <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-3 text-sm">
                <LucideActivity size={18} className="text-emerald-500" />
                Latest Network Velocity
              </h3>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Post-Synchronization</span>
           </div>
           <div className="p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mb-4 animate-pulse">
                 <LucideLoader size={32} />
              </div>
              <p className="text-sm font-medium text-slate-500 italic max-w-sm">
                Advanced behavioral analytics and fraud detection logs are currently synchronizing with the SusuPay node.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
