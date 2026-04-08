"use client";
import { useState } from "react";
import axios from "axios";
import { LucideX, LucideWallet, LucideArrowUpRight, LucideSmartphone, LucideLoader } from "lucide-react";
import { API_BASE_URL } from "@/app/constants";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  balance: string;
}

export default function WithdrawalModal({ isOpen, onClose, onSuccess, userId, balance }: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [provider, setProvider] = useState("MTN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) > parseFloat(balance)) {
      setError("Insufficient balance.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create Withdrawal Request Route (Need to add to server/routes/transactions.js)
      await axios.post(`${API_BASE_URL}/api/transactions/withdraw`, {
        userId, amount, momoNumber, momoProvider: provider
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Withdrawal request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a0f1a]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-card p-8 glow-border relative animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <LucideX size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
            <LucideWallet size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Request Payout</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Withdraw to Mobile Money</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Amount (₵)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">₵</span>
              <input 
                required
                type="number" 
                placeholder="0.00"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-500/50 outline-none transition-all font-mono font-bold"
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-500 ml-1">Available: ₵{balance}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Provider</label>
              <select 
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer text-sm font-medium"
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="MTN">MTN</option>
                <option value="VODAFONE">Telecel</option>
                <option value="AIRTELTIGO">AT</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Number</label>
              <div className="relative">
                <LucideSmartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  type="tel" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-mono"
                  placeholder="054XXXXXXX"
                  onChange={(e) => setMomoNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <LucideLoader className="animate-spin" size={20} />
            ) : (
              <>
                <LucideArrowUpRight size={20} />
                <span>Request Withdrawal</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
