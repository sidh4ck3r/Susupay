"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideArrowUpRight, LucideLoader, LucideClock, LucideCheckCircle, LucideXCircle, LucideLogOut } from "lucide-react";
import WithdrawalModal from "@/components/WithdrawalModal";
import NotificationBell from "@/components/NotificationBell";

export default function WithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
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
      const [profileRes, withdrawalsRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/profile/${id}`),
        axios.get(`${API_BASE_URL}/api/transactions/withdrawals/${id}`),
        axios.get(`${API_BASE_URL}/api/transactions/history/${id}`)
      ]);
      setUser(profileRes.data);
      setWithdrawals(withdrawalsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Withdrawals fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenWithdrawal = () => {
    if (user?.kycStatus !== 'VERIFIED') {
      alert("Identity Verification Required: Please complete your KYC verification to enable withdrawals.");
      router.push("/kyc");
      return;
    }
    setIsModalOpen(true);
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
               Fund <span className="text-emerald-500">Exit</span>
            </h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">
               Withdrawal Station <span className="text-emerald-500 opacity-50 ml-2">• Secure</span>
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

      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
         <div className="text-center md:text-left">
           <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Available Balance</h2>
           <p className="text-4xl font-black text-white font-mono">₵{user?.balance || "0.00"}</p>
         </div>
         <button 
           onClick={handleOpenWithdrawal}
           className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-3 group animate-in zoom-in duration-500"
         >
           <LucideArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           Request Secure Payout
         </button>
      </div>

      <WithdrawalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
        userId={user?.id}
        balance={user?.balance || "0.00"}
      />

      <div className="max-w-7xl mx-auto w-full relative z-[0] mt-10">
        <div className="glass-card overflow-hidden shadow-2xl border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Exit History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-5">Exit Point</th>
                <th className="px-6 py-5">Volume</th>
                <th className="px-6 py-5">Protocol Status</th>
                <th className="px-6 py-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.length > 0 ? withdrawals.map((w: any) => (
                <tr key={w.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white uppercase tracking-tight">{w.momoProvider}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">{w.momoNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono font-black text-white text-lg italic">₵{w.amount}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {w.status === 'PENDING' ? <LucideClock size={14} className="text-yellow-500 animate-pulse" /> : 
                       w.status === 'APPROVED' ? <LucideCheckCircle size={14} className="text-emerald-500" /> : 
                       <LucideXCircle size={14} className="text-red-500" />}
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                        w.status === 'APPROVED' ? 'text-emerald-500' : 
                        w.status === 'PENDING' ? 'text-yellow-500' : 
                        'text-red-400'
                      }`}>{w.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[10px] text-slate-500 uppercase font-black tracking-widest">{new Date(w.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-600 italic text-xs uppercase font-black tracking-widest opacity-50">No exit requests found in history</td>
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
  );
}
