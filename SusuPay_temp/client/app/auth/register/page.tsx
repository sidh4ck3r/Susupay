"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideShieldCheck, LucideArrowRight, LucideUser, LucideMail, LucideLock, LucideSmartphone, LucideAlertCircle, LucideX } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", momoNumber: "", momoProvider: "MTN" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      router.push("/auth?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-4">
            <LucideShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-slate-400 text-sm mt-1">Start Your Premium Savings Journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
            <LucideAlertCircle size={18} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 ml-1">Full Name</label>
            <div className="relative">
              <LucideUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <LucideMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email" 
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">MoMo Provider</label>
              <select 
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer"
                value={formData.momoProvider}
                onChange={(e) => setFormData({...formData, momoProvider: e.target.value})}
              >
                <option value="MTN">MTN</option>
                <option value="VODAFONE">Telecel</option>
                <option value="AIRTELTIGO">AT</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">MoMo Number</label>
              <div className="relative">
                <LucideSmartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="tel" 
                  required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  placeholder="054XXXXXXX"
                  value={formData.momoNumber}
                  onChange={(e) => setFormData({...formData, momoNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
            <div className="relative">
              <LucideLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" 
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
          >
            {isLoading ? "Creating Your Vault..." : "Create Secure Account"}
            {!isLoading && <LucideArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account? <a href="/auth" className="text-emerald-400 hover:text-emerald-300 font-medium">Log In</a>
        </p>
      </div>
    </div>
  );
}
