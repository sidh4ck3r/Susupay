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
        axios.get(`${API_BASE_URL}/api/collector/customers`, config),
        axios.get(`${API_BASE_URL}/api/collector/daily/${currentUser.id}`, config)
      ]);
      
      setUsers(usersRes.data);
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
      
      // KYC Guard for Collectors
      if (parsedUser.kycStatus === 'UNVERIFIED' || parsedUser.kycStatus === 'REJECTED') {
        console.log("🔒 KYC Required for Collector Terminal.");
        router.push("/kyc");
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
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative">
      {/* Decorative Background Element - Subtle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      {/* Sticky Terminal Header */}
      <div className="sticky top-0 z-[150] -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 mb-4 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5 animate-in fade-in slide-in-from-top-4 duration-700">
        <header className="max-w-7xl mx-auto w-full flex items-center justify-between pl-16 lg:pl-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <LucideSmartphone size={18} />
              </div>
              <h1 className="text-sm font-black tracking-widest text-white uppercase">
                Field Terminal
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 ml-10">Operational Cycle <span className="text-emerald-500/50 ml-1">Active</span></p>
          </div>

          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/10 rounded-xl transition-all text-slate-400 hover:text-red-400 border border-white/5 group shadow-lg"
            title="Exit Terminal"
          >
            <LucideLogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </header>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-[0] mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Collection Form - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.02] to-transparent">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <LucideCoins className="text-emerald-500" size={28} />
                  Record Cash Deposit
                </h2>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed max-w-lg">
                  Direct field collection entry. Ensure you verify the customer identity and 
                  amount before confirming the transaction.
                </p>

                <form onSubmit={handleCollection} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Wealth Builder</label>
                    <select 
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer font-bold text-sm uppercase tracking-wider"
                      onChange={(e) => setSelectedCustomer(customers.find(u => u.id === e.target.value))}
                    >
                      <option value="">Select Customer...</option>
                      {customers.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName} (Bal: ₵{u.balance})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contribution Amount (₵)</label>
                    <input 
                      required
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 px-4 text-2xl font-black font-mono focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-white placeholder:text-slate-800"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Manual Receipt / Notes</label>
                    <input 
                      type="text"
                      placeholder="Add collection notes or receipt number..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 px-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button 
                      type="submit"
                      disabled={isLoading || !selectedCustomer}
                      className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                    >
                      {isLoading ? <LucideLoader className="animate-spin" size={20} /> : <LucideCheckCircle size={20} />}
                      {isLoading ? "Synchronizing Asset..." : "Confirm & Sync Collection"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Terminal Navigation Hub */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">Terminal Hub</h3>
            
            <button 
              onClick={() => router.push("/collector/directory")}
              className="w-full glass-card p-6 flex items-center gap-4 group hover:border-emerald-500/30 transition-all"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                <LucideUserSearch size={22} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Customer Directory</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strike Rate & Metrics</p>
              </div>
            </button>

            <button 
              onClick={() => router.push("/collector/performance")}
              className="w-full glass-card p-6 flex items-center gap-4 group hover:border-blue-500/30 transition-all"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/10 group-hover:scale-110 transition-transform">
                <LucideHistory size={22} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Performance Hub</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily operational logs</p>
              </div>
            </button>

            <div className="glass-card p-6 border-white/5 bg-slate-950/20 mt-8">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Operational Status</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Global Sync</span>
                  <span className="text-white font-bold">Online</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Terminal Encryption</span>
                  <span className="text-white font-bold">AES-256</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
