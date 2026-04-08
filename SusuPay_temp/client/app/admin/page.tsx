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
      const [overviewRes, usersRes, withdrawalsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/overview`, config),
        axios.get(`${API_BASE_URL}/api/admin/users`, config),
        axios.get(`${API_BASE_URL}/api/admin/withdrawals`, config)
      ]);
      setOverview(overviewRes.data);
      setUsers(usersRes.data);
      setWithdrawals(withdrawalsRes.data);
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
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-6 relative overflow-hidden text-slate-100">
        <div className="z-10 w-full max-w-md glass-card p-8 glow-border">
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
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      {/* Decorative Background Element - Subtle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center justify-between pt-12 pb-10 pl-16 lg:pl-0">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase tracking-[0.15em]">
            {getUserRole() === 'AUDITOR' ? 'Auditor Terminal' : 'Admin Command Center'}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">SusuPay Financial Oversight</p>
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
            className="p-3 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 group"
            title="Secure Sign Out"
          >
            <LucideLogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

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
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Status</p>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-white">100%</h3>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 mt-10 space-y-10">
        {/* Users Management Section */}
        <div id="users" className="glass-card overflow-hidden shadow-2xl border-white/5">
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <h3 className="font-bold flex items-center gap-3">
              <LucideUsers size={20} className="text-emerald-500" />
              User Verification Registry
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">KYC Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group border-b border-white/5">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{u.fullName}</span>
                        <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold tracking-wider">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-400">₵{u.balance}</span>
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
                        {getUserRole() === 'ADMIN' && u.kycStatus !== 'VERIFIED' && (
                          <button 
                            onClick={() => updateKYC(u.id, 'VERIFIED')}
                            className="p-2 glass-card hover:bg-emerald-500/10 text-emerald-500 border-white/5 transition-all shadow-lg"
                          >
                            <LucideCheckCircle size={18} />
                          </button>
                        )}
                        {getUserRole() === 'ADMIN' && u.kycStatus !== 'REJECTED' && (
                          <button 
                            onClick={() => updateKYC(u.id, 'REJECTED')}
                            className="p-2 glass-card hover:bg-red-500/10 text-red-400 border-white/5 transition-all shadow-lg"
                          >
                            <LucideXCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit & Export Hub */}
        <div className="glass-card p-8 border-emerald-500/10 bg-gradient-to-r from-emerald-500/[0.02] to-transparent">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-3">
                <LucideDownload size={24} className="text-emerald-500" />
                Financial Audit Hub
              </h3>
              <p className="text-slate-500 text-sm mt-1">Export transaction data for external compliance and auditing.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none min-w-[160px]">
                <LucideFilter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <select 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="DEPOSIT">Deposits</option>
                  <option value="WITHDRAWAL">Withdrawals</option>
                  <option value="TRANSFER">Transfers</option>
                </select>
              </div>
              
              <button 
                onClick={exportToCSV}
                className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
              >
                <LucideDownload size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawal Management Section */}
        <div id="withdrawals" className="glass-card overflow-hidden shadow-2xl border-white/5">
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-3">
              <LucideActivity size={20} className="text-red-500" />
              Payout Approval Queue
            </h3>
            <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
              {withdrawals.filter(w => w.status === 'PENDING').length} Pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Beneficiary</th>
                  <th className="px-6 py-4">MoMo Details</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.length > 0 ? withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{w.User?.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Bal: ₵{w.User?.balance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-300">{w.momoNumber}</span>
                        <span className="text-[10px] font-black text-slate-500">{w.momoProvider}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-lg">₵{w.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        w.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 
                        w.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {getUserRole() === 'ADMIN' && w.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleWithdrawal(w.id, 'APPROVED')}
                              className="p-2 glass-card hover:bg-emerald-500/10 text-emerald-500 border-white/5 transition-all shadow-lg"
                            >
                              <LucideCheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleWithdrawal(w.id, 'REJECTED')}
                              className="p-2 glass-card hover:bg-red-500/10 text-red-400 border-white/5 transition-all shadow-lg"
                            >
                              <LucideXCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic text-sm">No payout requests found.</td>
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
