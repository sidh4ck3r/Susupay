"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { 
  LucideUsers, 
  LucideUserSearch, 
  LucideLoader,
  LucideArrowLeft,
  LucideTrendingUp,
  LucideHistory
} from "lucide-react";
import Link from "next/link";

export default function CollectorCustomerDirectory() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return false;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return false;
    const user = JSON.parse(storedUser);
    return user.role === 'COLLECTOR' || user.role === 'ADMIN';
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem("susupay_token");
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const res = await axios.get(`${API_BASE_URL}/api/collector/customers`, config);
      setCustomers(res.data);
    } catch (err: any) {
      console.error("Collector fetch error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthorized(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (checkAuthStatus()) {
      setIsAuthorized(true);
      fetchCustomers();
    } else {
      router.push("/collector");
    }
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-emerald-500">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center justify-between pt-12 pb-10 pl-16 lg:pl-0">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <Link href="/collector" className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors text-xs font-black uppercase tracking-widest mb-4 group">
            <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Terminal
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase tracking-[0.15em]">
            Customer Directory
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage Assigned Contributors & Strike Rates</p>
        </div>

        <div className="relative w-full md:w-80">
          <LucideUserSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Search customers..."
            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="glass-card overflow-hidden shadow-2xl border-white/5">
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
             <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-3">
                  <LucideUsers size={20} className="text-emerald-500" />
                  Assigned Wealth Builders
                </h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded">
                  {filteredCustomers.length} Total
                </span>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Susu Balance</th>
                  <th className="px-6 py-4">Consistency</th>
                  <th className="px-6 py-4">KYC Status</th>
                  <th className="px-6 py-4 text-center">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.length > 0 ? filteredCustomers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{u.fullName}</span>
                        <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-400">₵{u.balance}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 w-[85%] rounded-full" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500">85%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        u.kycStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        u.kycStatus === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                         <button 
                           onClick={() => router.push(`/dashboard/transactions?userId=${u.id}`)}
                           className="p-2 glass-card hover:bg-blue-500/10 text-blue-400 border-white/5 transition-all shadow-lg"
                           title="View History"
                         >
                           <LucideHistory size={16} />
                         </button>
                         <button 
                           className="p-2 glass-card hover:bg-emerald-500/10 text-emerald-500 border-white/5 transition-all shadow-lg"
                           title="Performance Analytics"
                         >
                           <LucideTrendingUp size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic text-sm">No customers found in your directory.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
