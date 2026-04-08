"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideUsers, LucideLoader, LucideLayoutGrid } from "lucide-react";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("susupay_user");
      if (!storedUser) {
        router.push("/auth");
        return;
      }
      const { id } = JSON.parse(storedUser);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/groups/user/${id}`);
        setGroups(res.data);
      } catch (err) {
        console.error("Groups fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
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

      <header className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center justify-center text-center pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <LucideUsers className="text-emerald-500" size={20} />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase tracking-wider">
            Group Susu Circles
          </h1>
        </div>
        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80">
          Manage your active Susu groups and contributions.
        </p>
      </header>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mt-10">
        {groups.length > 0 ? groups.map((group: any) => (
          <div 
            key={group.id} 
            onClick={() => router.push(`/dashboard/groups/${group.id}`)}
            className="glass-card p-6 border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent hover:border-emerald-500/30 transition-all group cursor-pointer active:scale-[0.98]"
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
              <span className="text-slate-400">Contr: <span className="text-white">₵{group.contributionAmount}</span></span>
              <span className="text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg leading-none">{group.frequency}</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full glass-card p-12 border-dashed border-white/10 text-center">
            <LucideUsers size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">No Active Circles Found</p>
            <button className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20">
              Join New Circle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
