"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { 
  LucideShieldCheck, 
  LucideCheckCircle, 
  LucideXCircle, 
  LucideLoader,
  LucideArrowLeft,
  LucideUserCheck,
  LucideFileText,
  LucideMapPin
} from "lucide-react";
import Link from "next/link";

export default function AdminKYCApproval() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isRejectingId, setIsRejectingId] = useState<string | null>(null);

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return false;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return false;
    const user = JSON.parse(storedUser);
    return user.role === 'ADMIN' || user.role === 'AUDITOR';
  };

  const fetchPendingKYC = async () => {
    const token = localStorage.getItem("susupay_token");
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const usersRes = await axios.get(`${API_BASE_URL}/api/admin/users`, config);
      const pending = usersRes.data.filter((u: any) => u.kycStatus === 'PENDING');
      setPendingUsers(pending);
    } catch (err: any) {
      console.error("KYC fetch error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthorized(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const processKYC = async (userId: string, status: 'VERIFIED' | 'REJECTED', adminNote?: string) => {
    setProcessingId(userId);
    const token = localStorage.getItem("susupay_token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.patch(`${API_BASE_URL}/api/admin/users/${userId}/kyc`, { status, adminNote }, config);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setIsRejectingId(null);
      setRejectionNote("");
      alert(`User KYC ${status === 'VERIFIED' ? 'Approved' : 'Rejected'} successfully.`);
    } catch (err) {
      console.error("KYC update error:", err);
      alert("Failed to update KYC status.");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    if (checkAuthStatus()) {
      setIsAuthorized(true);
      fetchPendingKYC();
    } else {
      router.push("/admin");
    }
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-blue-500">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-20 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-10 pt-12 pb-10">
        <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors text-xs font-black uppercase tracking-widest mb-4 group w-fit">
          <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Command Center
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase tracking-[0.15em]">
              Verification Queue
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Pending Identity Audits</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest">
            {pendingUsers.length} Requests Pending
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pendingUsers.length > 0 ? pendingUsers.map((u) => (
          <div key={u.id} className="glass-card p-6 border-white/5 hover:border-blue-500/30 transition-all shadow-2xl flex flex-col group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/10">
                  <LucideUserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{u.fullName}</h3>
                  <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{u.email}</p>
                </div>
              </div>
              <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase tracking-tighter">Pending</span>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <LucideFileText size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">ID Documentation</span>
                </div>
                <div className="pl-6">
                  <p className="text-xs font-bold text-white">{u.idType || "Not Specified"}</p>
                  <p className="text-[11px] font-mono text-blue-400 mt-1">{u.idNumber || "No ID Number Provided"}</p>
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <LucideMapPin size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Residential Address</span>
                </div>
                <div className="pl-6">
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {u.address || "No address provided for this user."}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              {isRejectingId === u.id ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <textarea 
                    className="w-full bg-slate-950 border border-red-500/20 rounded-xl p-3 text-xs font-medium text-slate-300 placeholder:text-slate-600 focus:ring-1 focus:ring-red-500/50 outline-none min-h-[80px]"
                    placeholder="Enter reason for rejection (e.g., ID is blurry, expired)..."
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => processKYC(u.id, 'REJECTED', rejectionNote)}
                      disabled={processingId === u.id || !rejectionNote.trim()}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                    <button 
                      onClick={() => {
                        setIsRejectingId(null);
                        setRejectionNote("");
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button 
                    disabled={processingId === u.id}
                    onClick={() => processKYC(u.id, 'VERIFIED')}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {processingId === u.id ? <LucideLoader className="animate-spin" size={14} /> : <LucideCheckCircle size={14} />}
                    Approve
                  </button>
                  <button 
                    disabled={processingId === u.id}
                    onClick={() => setIsRejectingId(u.id)}
                    className="flex-1 py-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <LucideXCircle size={14} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass-card border-dashed border-white/10 opacity-60">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mb-4">
                <LucideShieldCheck size={32} />
             </div>
             <h3 className="text-lg font-bold text-white">All Clear</h3>
             <p className="text-slate-500 text-xs font-medium">No pending identity verification requests at this time.</p>
          </div>
        )}
      </div>

      {/* Decorative */}
      <div className="fixed bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-blue-500/[0.03] to-transparent pointer-events-none" />
    </div>
  );
}
