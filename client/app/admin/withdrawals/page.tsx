"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { 
  LucideActivity, 
  LucideCheckCircle, 
  LucideXCircle, 
  LucideLoader,
  LucideArrowLeft,
  LucideArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function AdminWithdrawalApprovals() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return false;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return false;
    const user = JSON.parse(storedUser);
    return user.role === 'ADMIN' || user.role === 'AUDITOR';
  };

  const getUserRole = () => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return null;
    return JSON.parse(storedUser).role;
  };

  const fetchWithdrawals = async () => {
    const token = localStorage.getItem("susupay_token");
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/withdrawals`, config);
      setWithdrawals(res.data);
    } catch (err: any) {
      console.error("Admin fetch error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthorized(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async (requestId: string, status: string) => {
    const token = localStorage.getItem("susupay_token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.patch(`${API_BASE_URL}/api/admin/withdrawals/${requestId}`, { status }, config);
      fetchWithdrawals();
    } catch (err) {
      console.error("Withdrawal update error:", err);
    }
  };

  useEffect(() => {
    if (checkAuthStatus()) {
      setIsAuthorized(true);
      fetchWithdrawals();
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

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/[0.01] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center justify-between pt-12 pb-10 pl-16 lg:pl-0">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors text-xs font-black uppercase tracking-widest mb-4 group">
            <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Command Center
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase tracking-[0.15em]">
            Payout Approval Queue
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Financial Disbursement Management</p>
        </div>
        
        <div className="bg-red-500/10 text-red-500 text-[10px] font-black px-4 py-2 rounded-lg border border-red-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          {withdrawals.filter(w => w.status === 'PENDING').length} Pending Requests
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="glass-card overflow-hidden shadow-2xl border-white/5">
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <h3 className="font-bold flex items-center gap-3 text-red-400">
              <LucideArrowUpRight size={20} />
              Active Withdrawal Requests
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Beneficiary</th>
                  <th className="px-6 py-4">MoMo Details</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.length > 0 ? withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{w.User?.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Bal: ₵{w.User?.balance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-300">{w.momoNumber}</span>
                        <span className="text-[10px] font-black text-slate-500">{w.momoProvider}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-lg">₵{w.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        w.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        w.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {getUserRole() === 'ADMIN' && w.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleWithdrawal(w.id, 'APPROVED')}
                              className="p-2 glass-card hover:bg-emerald-500/10 text-emerald-500 border-white/5 transition-all shadow-lg"
                              title="Approve Payout"
                            >
                              <LucideCheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleWithdrawal(w.id, 'REJECTED')}
                              className="p-2 glass-card hover:bg-red-500/10 text-red-400 border-white/5 transition-all shadow-lg"
                              title="Reject Payout"
                            >
                              <LucideXCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic text-sm">No payout requests found in the system.</td>
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
