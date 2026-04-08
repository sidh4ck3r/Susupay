"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideArrowUpRight, LucideLoader, LucideClock, LucideCheckCircle, LucideXCircle } from "lucide-react";
import WithdrawalModal from "@/components/WithdrawalModal";

export default function WithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const { id } = JSON.parse(storedUser);
    try {
      const [profileRes, withdrawalsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auth/profile/${id}`),
        axios.get(`${API_BASE_URL}/api/transactions/withdrawals/${id}`)
      ]);
      setUser(profileRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch (err) {
      console.error("Withdrawals fetch error:", err);
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

      <header className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center justify-center text-center pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <LucideArrowUpRight className="text-emerald-500" size={20} />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase tracking-wider">
            Withdrawal Requests
          </h1>
        </div>
        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80">
          Manage and track your payout requests to Mobile Money.
        </p>
      </header>

      <div className="max-w-7xl mx-auto w-full relative z-10 mt-10">
        <div className="glass-card overflow-hidden shadow-2xl border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="font-bold">Payout Status</h3>
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
                  <td className="px-6 py-4 font-mono font-bold text-white text-lg">₵{w.amount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {w.status === 'PENDING' ? <LucideClock size={14} className="text-yellow-500" /> : 
                       w.status === 'APPROVED' ? <LucideCheckCircle size={14} className="text-emerald-500" /> : 
                       <LucideXCircle size={14} className="text-red-500" />}
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
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic text-sm">No payout requests found.</td>
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
