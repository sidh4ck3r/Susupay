"use client";
import { useState } from "react";
import axios from "axios";
import { LucideX, LucideTarget, LucideTrendingUp, LucideCalendar, LucidePlusCircle, LucideLoader } from "lucide-react";
import { API_BASE_URL } from "@/app/constants";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function CreateGoalModal({ isOpen, onClose, onSuccess, userId }: CreateGoalModalProps) {
  const [formData, setFormData] = useState({ title: "", targetAmount: "", category: "General", deadline: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/api/savings`, {
        ...formData,
        userId
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create goal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a0f1a]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-card p-8 glow-border relative animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <LucideX size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <LucideTarget size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">New Savings Goal</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Set your next milestone</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Goal Title</label>
            <div className="relative">
              <LucideTrendingUp size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                required
                type="text" 
                placeholder="e.g., Xmas Savings, New Phone"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-medium"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Target (₵)</label>
              <input 
                required
                type="number" 
                placeholder="0.00"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-mono font-bold"
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Deadline</label>
              <div className="relative text-slate-400">
                <LucideCalendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="date" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm appearance-none"
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
            <select 
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer font-medium"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="General">General Savings</option>
              <option value="Business">Business Capital</option>
              <option value="Emergency">Emergency Fund</option>
              <option value="Holiday">Holiday/Travel</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <LucideLoader className="animate-spin" size={20} />
            ) : (
              <>
                <LucidePlusCircle size={20} />
                <span>Initialize Goal</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
