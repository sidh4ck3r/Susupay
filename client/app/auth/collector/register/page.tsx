"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideShieldCheck, LucideArrowRight, LucideUser, LucideMail, LucideLock, LucideAlertCircle, LucideSmartphone, LucideX } from "lucide-react";

export default function CollectorRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", role: "COLLECTOR" });
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
      await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      router.push("/auth/collector?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Application failed. Please try again.");
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
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <LucideSmartphone size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Agent Application</h2>
          <p className="text-slate-400 text-sm mt-1">Register as a SusuPay Field Collector</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <LucideAlertCircle size={18} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
            <div className="relative">
              <LucideUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                placeholder="Agent Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <LucideMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email" 
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                placeholder="agent@susupay.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative">
              <LucideLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" 
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 mt-2">
             <p className="text-[10px] text-emerald-500/80 font-medium leading-relaxed italic">
               Note: All collector applications are subject to manual verification by the SusuPay Admin board before full access is granted.
             </p>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
          >
            {isLoading ? "Processing Application..." : "Submit Agent Registration"}
            {!isLoading && <LucideArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Already a collector? <a href="/auth/collector" className="text-emerald-400 hover:text-emerald-300 font-bold underline-offset-4 hover:underline transition-colors">Log In</a>
        </p>
      </div>
    </div>
  );
}
