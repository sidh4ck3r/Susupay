"use client";
import { useState } from "react";
import axios from "axios";
import { LucideX, LucideShieldCheck, LucideFileText, LucideMapPin, LucideLoader, LucideCheckCircle } from "lucide-react";
import { API_BASE_URL } from "@/app/constants";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function KYCModal({ isOpen, onClose, onSuccess, userId }: KYCModalProps) {
  const [formData, setFormData] = useState({
    idType: "Ghana Card",
    idNumber: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.put(`${API_BASE_URL}/api/auth/kyc/${userId}`, formData);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a0f1a]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg glass-card p-8 glow-border relative animate-in zoom-in-95 duration-300">
        {!isSuccess && (
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <LucideX size={24} />
          </button>
        )}

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <LucideCheckCircle size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Documents Submitted</h2>
              <p className="text-slate-400">Our auditors are reviewing your identity. This usually takes less than 24 hours.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                <LucideShieldCheck size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Identity Verification</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Secure KYC Portal</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Document Type</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer text-sm font-medium text-slate-200"
                      value={formData.idType}
                      onChange={(e) => setFormData({...formData, idType: e.target.value})}
                    >
                      <option value="Ghana Card">Ghana Card (GHA-XXX)</option>
                      <option value="Passport">Passport</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Number</label>
                  <div className="relative">
                    <LucideFileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm font-mono text-white placeholder:text-slate-700"
                      placeholder="e.g. GHA-726191-0"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
                <div className="relative">
                  <LucideMapPin size={16} className="absolute left-4 top-4 text-slate-500" />
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm font-medium text-white placeholder:text-slate-700 resize-none"
                    placeholder="Enter your full digital or physical address..."
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <LucideLoader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <LucideShieldCheck size={20} />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[9px] text-slate-500 mt-4 font-bold uppercase tracking-wider">
                  Verified by SusuPay Secure Identity Protocol
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
