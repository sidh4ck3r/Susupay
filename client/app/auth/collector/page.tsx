"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideSmartphone, LucideArrowRight, LucideMail, LucideLock, LucideAlertCircle, LucideShieldCheck, LucideX } from "lucide-react";

export default function CollectorLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("susupay_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'COLLECTOR' || user.role === 'ADMIN') {
        router.push("/collector");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      const user = response.data.user;
      
      if (user.role !== 'COLLECTOR' && user.role !== 'ADMIN') {
        setError("Unauthorized access. This terminal is for collectors only.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("susupay_token", response.data.token);
      localStorage.setItem("susupay_user", JSON.stringify(user));

      if (user.kycStatus === 'UNVERIFIED' || user.kycStatus === 'REJECTED') {
        console.log("🔒 KYC Required: Redirecting agent to verification.");
        router.push("/kyc");
      } else {
        router.push("/collector");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your collector credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-6 relative overflow-hidden text-slate-100">
      <button 
        onClick={() => router.push("/")}
        className="fixed top-6 right-6 p-2 text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-full z-[100] group border border-white/5 hover:border-white/20 shadow-2xl"
        title="Exit to Landing Page"
      >
        <LucideX size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className="z-10 w-full max-w-md glass-card p-8 glow-border">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <LucideSmartphone size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Collector Terminal</h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">Secure Access for Field Agents</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <LucideAlertCircle size={18} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Agent ID / Email</label>
            <div className="relative">
              <LucideMail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email" 
                required
                placeholder="agent@susupay.com"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative">
              <LucideLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none font-mono"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Open Terminal"}
            {!isLoading && <LucideArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-tighter">
            New Collector? <a href="/auth/collector/register" className="text-emerald-400 hover:text-emerald-300 transition-colors">Apply for Access</a>
          </p>
          <div className="flex justify-center">
            <a href="/auth" className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors flex items-center gap-1">
              <LucideShieldCheck size={12} />
              Switch to Customer Login
            </a>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] -z-0" />
    </div>
  );
}
