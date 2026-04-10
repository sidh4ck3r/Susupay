"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideShieldCheck, LucideArrowRight, LucideUser, LucideMail, LucideLock, LucideSmartphone, LucideAlertCircle, LucideX, LucideEye, LucideEyeOff, LucideCheckCircle } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", momoNumber: "", momoProvider: "MTN" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Register with Supabase
      const { data: { user: supabaseUser }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!supabaseUser) throw new Error("Registration failed in Supabase.");

      // 2. Sync with Backend (and pass extra MoMo data)
      const response = await axios.post(`${API_BASE_URL}/api/auth/supabase`, {
        googleId: supabaseUser.id,
        email: formData.email,
        name: formData.fullName,
        momoNumber: formData.momoNumber,
        momoProvider: formData.momoProvider
      });

      // 3. Auto-login and Mandatory KYC Redirect
      localStorage.setItem("susupay_token", response.data.token);
      localStorage.setItem("susupay_user", JSON.stringify(response.data.user));

      setSuccess(true);
      setTimeout(() => router.push("/kyc"), 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0f1a] flex items-center justify-center p-6 text-slate-100">
        <div className="glass-card p-10 glow-border text-center max-w-sm w-full animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6 shadow-2xl shadow-emerald-500/20 border border-emerald-500/20">
            <LucideCheckCircle size={40} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-3">Account Created!</h3>
          <p className="text-slate-400 text-sm font-medium">Redirecting you to login...</p>
          <div className="mt-6 w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0f1a] flex items-start md:items-center justify-center p-6 pt-10 md:pt-0 relative overflow-y-auto text-slate-100">
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
          <p className="text-slate-400 text-sm mt-1 text-center font-medium">Start Your Premium Savings Journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <LucideAlertCircle size={18} className="shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <LucideUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                id="register-fullname"
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
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <LucideMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                id="register-email"
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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MoMo Provider</label>
              <select 
                id="register-provider"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer text-sm"
                value={formData.momoProvider}
                onChange={(e) => setFormData({...formData, momoProvider: e.target.value})}
              >
                <option value="MTN">MTN</option>
                <option value="VODAFONE">Telecel</option>
                <option value="AIRTELTIGO">AT</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MoMo Number</label>
              <div className="relative">
                <LucideSmartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  id="register-momo"
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
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <LucideLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                id="register-password"
                type={showPassword ? "text" : "password"} 
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-12 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-mono"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <LucideEyeOff size={16} /> : <LucideEye size={16} />}
              </button>
            </div>
          </div>

          <button 
            id="register-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
          >
            {isLoading ? "Creating Your Vault..." : "Create Secure Account"}
            {!isLoading && <LucideArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-8 font-medium">
          Already have an account? <a href="/auth" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors underline-offset-4 hover:underline">Log In</a>
        </p>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] -z-0" />
    </div>
  );
}
