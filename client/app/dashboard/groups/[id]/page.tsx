"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { 
  LucideArrowLeft, 
  LucideUsers, 
  LucideCalendar, 
  LucideTrendingUp, 
  LucideCoins, 
  LucideClock, 
  LucideCheckCircle2, 
  LucideAlertCircle,
  LucideLayoutGrid
} from "lucide-react";

export default function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [userMember, setUserMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("susupay_user");
      if (!storedUser) {
        router.push("/auth");
        return;
      }
      const currentUser = JSON.parse(storedUser);
      
      try {
        const res = await axios.get(`${API_BASE_URL}/api/groups/${resolvedParams.id}`);
        setGroup(res.data);
        
        // Find current user's membership data
        const member = res.data.GroupMembers.find((m: any) => m.UserId === currentUser.id);
        setUserMember(member);
      } catch (err) {
        console.error("Group details fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams.id, router]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-emerald-500 bg-[#0a0f1a]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center text-slate-100 bg-[#0a0f1a]">
      <p>Group not found</p>
    </div>
  );

  // Calculate Progress
  const totalPotValue = group.contributionAmount * group.GroupMembers.length;
  const currentTotalContributed = group.GroupMembers.reduce((sum: number, m: any) => sum + parseFloat(m.totalContributed || 0), 0);
  const contributionPercentage = (currentTotalContributed / totalPotValue) * 100;
  
  const userContributed = parseFloat(userMember?.totalContributed || 0);
  const userTarget = parseFloat(group.contributionAmount);
  const userProgress = (userContributed / userTarget) * 100;

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-20 text-slate-100 bg-[#0a0f1a] relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10 pt-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <LucideArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Circles</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Info Section */}
          <div className="lg:col-span-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <LucideLayoutGrid className="text-emerald-500" size={24} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
                    {group.name}
                  </h1>
                </div>
                <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                  {group.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="glass-card px-4 py-2 border-white/5 bg-white/[0.02] rounded-xl flex items-center gap-3">
                    <LucideClock size={16} className="text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Freq: <span className="text-white">{group.frequency}</span>
                    </span>
                 </div>
              </div>
            </header>

            {/* Premium Progress Bar (Pot Focus) */}
            <div className="glass-card p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <LucideTrendingUp size={120} />
               </div>
               
               <div className="relative z-10">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Circle Accumulation</p>
                      <h2 className="text-4xl font-black text-white">₵{currentTotalContributed.toLocaleString()}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Final Pot Value</p>
                      <p className="text-xl font-bold text-slate-300">₵{totalPotValue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      style={{ width: `${Math.max(5, contributionPercentage)}%` }}
                    >
                      <div className="absolute top-0 bottom-0 right-0 w-8 bg-white/20 blur-sm animate-pulse" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Member List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <LucideUsers size={18} className="text-emerald-500" />
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Circle Members</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {group.GroupMembers.length} Participants
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.GroupMembers.map((member: any) => (
                  <div key={member.id} className="glass-card p-4 border-white/5 flex items-center gap-4 hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-slate-400 border border-white/5">
                      {member.User?.fullName?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{member.User?.fullName}</p>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">{member.role}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-emerald-500">₵{member.totalContributed}</p>
                       <p className={`text-[8px] font-bold uppercase ${member.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-600'}`}>
                         {member.status}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Personal Stats */}
          <div className="lg:col-span-4 space-y-8">
            {/* User Progress Gauge */}
            <div className="glass-card p-8 border-emerald-500/10 bg-emerald-500/[0.02] flex flex-col items-center justify-center text-center relative">
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-emerald-500 text-[#0a0f1a] text-[9px] font-black rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                Personal Progress
              </div>
              
              <div className="relative w-40 h-40 mb-6 group">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * Math.min(100, userProgress)) / 100}
                    className="text-emerald-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <h2 className="text-3xl font-black text-white">{Math.round(userProgress)}%</h2>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Completed</p>
                </div>
              </div>

              <div className="space-y-2 w-full">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Paid</span>
                    <span className="text-white">₵{userContributed}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Remaining</span>
                    <span className="text-emerald-500">₵{Math.max(0, userTarget - userContributed)}</span>
                 </div>
              </div>
              
              <button 
                onClick={() => router.push(`/dashboard/deposit?amount=${group.contributionAmount}&groupId=${group.id}&groupName=${encodeURIComponent(group.name)}&provider=${userMember?.User?.momoProvider || ''}`)}
                className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/40 transition-all active:scale-[0.98]"
              >
                Contribute Now
              </button>
            </div>

            {/* Payout Forecast */}
            <div className="glass-card p-6 border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                 <LucideCalendar size={20} className="text-blue-500" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">Payout Info</h3>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold overflow-hidden shadow-inner">
                       {userMember?.payoutOrder || '?'}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payout Position</p>
                       <p className="text-xs font-bold text-white">Rank in cycle</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                       userMember?.hasReceivedPayout ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                       {userMember?.hasReceivedPayout ? <LucideCheckCircle2 size={16} /> : <LucideClock size={16} />}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Collection Status</p>
                       <p className="text-xs font-bold text-white">
                         {userMember?.hasReceivedPayout ? 'Received' : 'Waiting for turn'}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                 <LucideAlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-blue-200/60 leading-relaxed font-medium">
                   Payouts are automatically credited to your SusuVault balance when your rank is reached and the pot is filled.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
