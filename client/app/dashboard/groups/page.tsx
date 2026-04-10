"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideUsers, LucideLoader, LucideLayoutGrid, LucideLogOut, LucideArrowRight } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function GroupsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
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
      const [profileRes, groupsRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/profile/${id}`),
        axios.get(`${API_BASE_URL}/api/groups/user/${id}`),
        axios.get(`${API_BASE_URL}/api/transactions/history/${id}`)
      ]);
      setUser(profileRes.data);
      setGroups(groupsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Groups fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoinCircle = () => {
    if (user?.kycStatus !== 'VERIFIED') {
      alert("Identity Verification Required: Please complete your KYC verification to join official Susu circles.");
      router.push("/kyc");
      return;
    }
    // Logic to join would go here
  };

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
              Susu <span className="text-emerald-500">Circles</span>
            </h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">
              Collective Prosperity <span className="text-emerald-500 opacity-50 ml-2">• Secure</span>
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

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-[0] mt-10">
        {groups.length > 0 ? groups.map((group: any) => (
          <div 
            key={group.id} 
            onClick={() => router.push(`/dashboard/groups/${group.id}`)}
            className="glass-card p-6 border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent hover:border-emerald-500/30 transition-all group cursor-pointer active:scale-[0.98] shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <LucideLayoutGrid size={20} />
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                group.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {group.status}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{group.name}</h4>
            <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">{group.description}</p>
            
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pt-4 border-t border-white/5">
              <span className="text-slate-400 font-black">CONTRIBUTION: <span className="text-white">₵{group.contributionAmount}</span></span>
              <span className="text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg font-black leading-none">{group.frequency}</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full glass-card p-12 border-dashed border-white/10 text-center animate-in zoom-in duration-500">
            <LucideUsers size={48} className="mx-auto text-slate-700 mb-4 opacity-50" />
            <p className="text-slate-500 font-black uppercase tracking-[0.2em]">No Active Circles Found</p>
            <button 
              onClick={handleJoinCircle}
              className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2 mx-auto group"
            >
              Join New Circle
              <LucideArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
