"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LucideSmartphone, LucideUserSearch, LucideCoins, LucideCheckCircle, LucideHistory, LucideLoader, LucideLogOut, LucideChevronLeft } from "lucide-react";
import { API_BASE_URL } from "@/app/constants";

export default function CollectorTerminal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [customers, setUsers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("susupay_user");
    localStorage.removeItem("susupay_token");
    window.location.href = "/auth/collector";
  };

  const fetchData = async (currentUser: any) => {
    const token = localStorage.getItem("susupay_token");
    if (!token) {
      router.push("/auth/collector");
      return;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      // Fetch all customers and collector's performance
      const [usersRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/users`, config),
        axios.get(`${API_BASE_URL}/api/collector/daily/${currentUser.id}`, config)
      ]);
      
      setUsers(usersRes.data.filter((u: any) => u.role === 'CUSTOMER'));
      setHistory(historyRes.data);
      setIsPageLoading(false);
    } catch (err: any) {
      console.error("Collector fetch error:", err);
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("susupay_token");
        localStorage.removeItem("susupay_user");
        router.push("/auth/collector");
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth/collector");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'COLLECTOR' && parsedUser.role !== 'ADMIN') {
        router.push("/dashboard");
        return;
      }
      
      setUser(parsedUser);
      fetchData(parsedUser);
    } catch (e) {
      localStorage.removeItem("susupay_user");
      router.push("/auth/collector");
    }
  }, []);

  const handleCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/collector/collect`, {
        collectorId: user.id,
        customerId: selectedCustomer.id,
        amount,
        notes
      });

      setHistory([response.data.transaction, ...history]);
      setAmount("");
      setNotes("");
      setSelectedCustomer(null);
      alert("Cash collection recorded successfully!");
    } catch (err) {
      console.error("Collection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-emerald-500">
        <LucideLoader size={48} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      {/* Decorative Background Element - Subtle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-20 flex items-center justify-between pt-8 pb-6 border-b border-white/5 pl-16 lg:pl-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <LucideChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
               <LucideSmartphone size={18} />
            </div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              Field Terminal
            </h1>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          <LucideLogOut size={16} />
          <span>Exit Terminal</span>
        </button>
      </header>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mt-10">
        {/* Collection Form */}
        <div className="glass-card p-8 glow-border h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <LucideUserSearch className="text-emerald-500" size={20} />
            New Cash Entry
          </h2>

          <form onSubmit={handleCollection} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Select Customer</label>
              <select 
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer font-medium"
                onChange={(e) => setSelectedCustomer(customers.find(u => u.id === e.target.value))}
              >
                <option value="">Choose a customer...</option>
                {customers.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} (Bal: ₵{u.balance})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Cash Amount (₵)</label>
              <input 
                required
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 px-4 text-2xl font-black font-mono focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Notes / Receipt #</label>
              <input 
                type="text"
                placeholder="Daily contribution..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading || !selectedCustomer}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? <LucideLoader className="animate-spin" /> : <LucideCheckCircle size={20} />}
              <span>Confirm & Sync Collection</span>
            </button>
          </form>
        </div>

        {/* Recent Collections */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5 bg-white/[0.01]">
            <h3 className="font-bold flex items-center gap-3 mb-6">
              <LucideHistory size={18} className="text-blue-400" />
              Your Terminal History
            </h3>
            <div className="space-y-4">
              {history.length > 0 ? history.map((trx) => (
                <div key={trx.id} className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex justify-between items-center animate-in slide-in-from-right-4">
                  <div>
                    <p className="text-xs font-bold text-white">₵{trx.amount}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Ref: {trx.reference.split('-')[1]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">Synced</p>
                    <p className="text-[10px] text-slate-600 uppercase font-bold">{new Date(trx.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-600 italic text-sm">No collections recorded in this session.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
