"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import { 
  LucideShieldCheck, 
  LucideUsers, 
  LucideActivity, 
  LucidePieChart, 
  LucideSettings, 
  LucideCheckCircle, 
  LucideXCircle, 
  LucideLoader, 
  LucideDownload, 
  LucideFilter,
  LucideLock,
  LucideMail,
  LucideAlertCircle,
  LucideArrowRight,
  LucideLogOut,
  LucideLayoutGrid,
  LucideArrowUpRight,
  LucideUserSearch
} from "lucide-react";

export default function AdminCommandCenter() {
  const router = useRouter();
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("DEPOSIT");
  
  // Auth states
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("susupay_user");
    localStorage.removeItem("susupay_token");
    router.push("/auth");
  };

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return false;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return false;
    const user = JSON.parse(storedUser);
    return user.role === 'ADMIN' || user.role === 'AUDITOR';
  };

  const getUserRole = () => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return null;
    return JSON.parse(storedUser).role;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword
      });
      
      const role = response.data.user.role;
      if (role !== 'ADMIN' && role !== 'AUDITOR') {
        setLoginError("Access Denied: This terminal is for administrators and auditors only.");
        return;
      }

      localStorage.setItem("susupay_token", response.data.token);
      localStorage.setItem("susupay_user", JSON.stringify(response.data.user));
      window.location.reload();
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const exportToCSV = async () => {
    const token = localStorage.getItem("susupay_token");
    const config = { headers: { Authorization: `Bearer ${token}` }, params: { type: reportType } };
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/reports/transactions`, config);
      const data = res.data;
      
      const csvRows = [
        ["Date", "User", "Reference", "Amount", "Provider", "Status"].join(","),
        ...data.map((row: any) => [
          new Date(row.createdAt).toLocaleDateString(),
          row.User?.fullName,
          row.reference,
          row.amount,
          row.provider,
          row.status
        ].join(","))
      ];

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `susupay_report_${reportType.toLowerCase()}_${Date.now()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const fetchAdminData = async () => {
    const token = localStorage.getItem("susupay_token");
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const [overviewRes, usersRes, withdrawalsRes, recentTrxRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/overview`, config),
        axios.get(`${API_BASE_URL}/api/admin/users`, config),
        axios.get(`${API_BASE_URL}/api/admin/withdrawals`, config),
        axios.get(`${API_BASE_URL}/api/admin/recent-transactions`, config)
      ]);
      setOverview(overviewRes.data);
      setUsers(usersRes.data);
      setWithdrawals(withdrawalsRes.data);
      setRecentTransactions(recentTrxRes.data);
    } catch (err) {
      console.error("Admin fetch error:", err);
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
      fetchAdminData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const updateKYC = async (userId: string, status: string) => {
    const token = localStorage.getItem("susupay_token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.patch(`${API_BASE_URL}/api/admin/users/${userId}/kyc`, { status }, config);
      fetchAdminData();
    } catch (err) {
      console.error("KYC update error:", err);
    }
  };

  const handleWithdrawal = async (requestId: string, status: string) => {
    const token = localStorage.getItem("susupay_token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.patch(`${API_BASE_URL}/api/admin/withdrawals/${requestId}`, { status }, config);
      fetchAdminData();
    } catch (err) {
      console.error("Withdrawal update error:", err);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-emerald-500">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-6 relative overflow-hidden text-slate-100 z-50">
        <div className="z-10 w-full max-w-md glass-card p-8 glow-border relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-4">
              <LucideShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1 text-center font-medium">SusuPay - Modern Ghana Savings</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <LucideAlertCircle size={18} />
              <p className="text-sm">{loginError}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAdminLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1 tracking-wide uppercase text-[10px]">Email Address</label>
              <div className="relative">
                <LucideMail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" 
                  required
                  placeholder="you@example.com"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1 tracking-wide uppercase text-[10px]">Secure Password</label>
              <div className="relative">
                <LucideLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none font-mono"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoggingIn ? "Verifying Credentials..." : "Access Your Vault"}
              {!isLoggingIn && <LucideArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
             <p className="text-xs text-slate-500 font-medium">Authorized Personnel Only</p>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] -z-0" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative">
      {/* Decorative Background Element - Subtle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-[100] flex flex-col md:flex-row items-center justify-between pt-6 md:pt-8 pb-8 pl-14 lg:pl-0">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase tracking-[0.15em]">
            {getUserRole() === 'AUDITOR' ? 'Auditor Terminal' : 'Admin Command Center'}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">SusuPay Financial Oversight Hub</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Status</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Operational
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/10 rounded-xl transition-all text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 group shadow-lg shadow-red-500/5"
            title="Secure Sign Out"
          >
            <LucideLogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Overview Stats Grid */}
      <div className="max-w-7xl mx-auto w-full relative z-10 mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-white/5 hover:border-emerald-500/30 transition-all shadow-xl group">
          <LucidePieChart className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Liquidity</p>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-white">₵{overview?.totalLiquidity || "0.00"}</h3>
        </div>
        <div className="glass-card p-6 border-white/5 hover:border-blue-500/30 transition-all shadow-xl group">
          <LucideUsers className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Users</p>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-white">{overview?.totalUsers}</h3>
        </div>
        <div className="glass-card p-6 border-white/5 hover:border-yellow-500/30 transition-all shadow-xl group">
          <LucideActivity className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Transactions</p>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-white">{overview?.totalTransactions}</h3>
        </div>
        <div className="glass-card p-6 border-white/5 hover:border-purple-500/30 transition-all shadow-xl group">
          <div className="flex justify-between items-start mb-4">
             <LucideShieldCheck className="text-purple-400 group-hover:scale-110 transition-transform" size={24} />
             <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">Healthy</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Health</p>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-white">100%</h3>
        </div>
      </div>

      {/* Main Command Hub Navigation */}
      <div className="max-w-7xl mx-auto w-full relative z-10 mt-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 ml-2">Command Hub Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Link href="/admin/users" className="glass-card p-8 group border-emerald-500/10 hover:border-emerald-500/40 transition-all shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                <LucideUsers size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 lowercase tracking-tighter capitalize">Registry Management</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-8">Manage role assignments, system access, and digital profiles for the SusuPay network.</p>
              <span className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Manage Registry <LucideArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/10 transition-colors" />
          </Link>

          <Link href="/admin/kyc" className="glass-card p-8 group border-blue-500/10 hover:border-blue-500/40 transition-all shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/10 group-hover:scale-110 transition-transform">
                <LucideShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Identity Audits</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-8">Review and verify user identity documents to ensure compliance with financial regulations.</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                  Verification Queue <LucideArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                {overview?.pendingKYC > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-full animate-pulse">
                    {overview?.pendingKYC}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/10 transition-colors" />
          </Link>

          <Link href="/admin/withdrawals" className="glass-card p-8 group border-red-500/10 hover:border-red-500/40 transition-all shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/10 group-hover:scale-110 transition-transform">
                <LucideArrowUpRight size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Payout Approvals</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-8">Review and authorize liquidity withdrawal requests to MoMo and external wallets.</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                  Review Queue <LucideArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                {withdrawals.filter(w => w.status === 'PENDING').length > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse">
                    {withdrawals.filter(w => w.status === 'PENDING').length}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2 group-hover:bg-red-500/10 transition-colors" />
          </Link>

          <Link href="/admin/performance" className="glass-card p-8 group border-emerald-500/10 hover:border-emerald-500/40 transition-all shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                <LucideActivity size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Performance Hub</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-8">Access detailed data visualizations, transaction velocity trends, and network growth analytics.</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  Enter Analytics Suite <LucideArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded italic">Level 2 Access</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/10 transition-colors" />
          </Link>

          <Link href="/admin/reports" className="glass-card p-8 group border-blue-500/10 hover:border-blue-400/40 transition-all shadow-2xl relative overflow-hidden lg:col-span-1">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/10 group-hover:scale-110 transition-transform">
                <LucideDownload size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Audit & Reports</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-8">Export detailed CSV summaries of deposits, withdrawals, and system-wide financial logs.</p>
              <span className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                Access Audit Hub <LucideArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/10 transition-colors" />
          </Link>

        </div>
      </div>

      {/* Recent Transaction Activity */}
      <div className="max-w-7xl mx-auto w-full relative z-10 mt-12">
        <div className="flex items-center justify-between mb-6 ml-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Transaction Stream</h2>
          <Link href="/admin/reports" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline">View All Records</Link>
        </div>
        
        <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Reference</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Provider</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 group-hover:text-white transition-colors uppercase">{trx.reference || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">{trx.User?.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-1 leading-none">{trx.User?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${trx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-white">₵{trx.amount}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">{trx.provider}</td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${trx.status === 'SUCCESS' ? 'bg-emerald-500 animate-pulse' : trx.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        <span className={trx.status === 'SUCCESS' ? 'text-emerald-500' : trx.status === 'PENDING' ? 'text-yellow-500' : 'text-red-500'}>
                          {trx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500 text-right">{new Date(trx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm font-medium italic">No recent activity detected in the system stream.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 opacity-50 contrast-75 hover:opacity-100 hover:contrast-100 transition-all grayscale hover:grayscale-0">
        <div className="glass-card p-6 border-white/5 flex items-center justify-between group pointer-events-none">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl"><LucideSettings size={20} className="text-slate-500 group-hover:text-white transition-colors" /></div>
              <div>
                <h4 className="text-sm font-bold text-white">System Configuration</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manage Merchant & API Keys</p>
              </div>
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded">V 1.0.4</span>
        </div>
        <div className="glass-card p-6 border-white/5 flex items-center justify-between group pointer-events-none">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl"><LucideUserSearch size={20} className="text-slate-500 group-hover:text-white transition-colors" /></div>
              <div>
                <h4 className="text-sm font-bold text-white">Internal Agent Chat</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Real-time support coordination</p>
              </div>
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded">Maintenance</span>
        </div>
      </div>
    </div>
  );
}
