"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import MomoDeposit from "@/components/MomoDeposit";
import { LucideCoins, LucideLoader, LucideLogOut } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

function DepositContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initialAmount = searchParams.get("amount") || "";
  const initialProvider = searchParams.get("provider") || "";
  const groupId = searchParams.get("groupId") || "";
  const groupName = searchParams.get("groupName") || "";

  const fetchData = async () => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }

    const { id } = JSON.parse(storedUser);
    
    try {
      const [profileRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/profile/${id}`),
        axios.get(`${API_BASE_URL}/api/transactions/history/${id}`)
      ]);
      
      if (profileRes.data.kycStatus !== 'VERIFIED') {
        alert("Identity Verification Required: Please complete your KYC verification to enable financial transactions.");
        router.push("/kyc");
        return;
      }
      
      setUser(profileRes.data);
      setHistory(historyRes.data);
      setIsLoading(false);
    } catch (err) {
      console.error("KYC session audit failed:", err);
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

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
               Fund <span className="text-emerald-500">Entry</span>
            </h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">
               Momo Terminal <span className="text-emerald-500 opacity-50 ml-2">• Encrypted</span>
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

      <div className="max-w-7xl mx-auto w-full text-center relative z-10">
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
           <LucideCoins size={14} className="text-emerald-500" />
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Verified Protocol</span>
         </div>
         <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
           {groupName ? `CIRCLE: ${groupName}` : 'FUND YOUR VAULT'}
         </h2>
         <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 max-w-lg mx-auto leading-relaxed">
           {groupName ? 'Transmitting contribution to shared savings goal.' : 'Initialize a secure mobile money transmission.'}
         </p>
      </div>

      <div className="max-w-md mx-auto relative z-10 mt-6">
        <MomoDeposit 
          initialAmount={initialAmount} 
          initialProvider={initialProvider} 
          groupId={groupId}
          onSuccess={() => router.push("/dashboard")} 
        />
      </div>
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-emerald-500 bg-[#0a0f1a]">
        <LucideLoader size={48} className="animate-spin" />
      </div>
    }>
      <DepositContent />
    </Suspense>
  );
}
