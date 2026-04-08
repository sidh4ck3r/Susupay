"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { 
  LucideDownload, 
  LucideFilter, 
  LucideLoader,
  LucideArrowLeft,
  LucideFileText,
  LucideCheckCircle
} from "lucide-react";
import Link from "next/link";

export default function AdminReportsHub() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("DEPOSIT");
  const [isExporting, setIsExporting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const checkAuthStatus = () => {
    if (typeof window === "undefined") return false;
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) return false;
    const user = JSON.parse(storedUser);
    return user.role === 'ADMIN' || user.role === 'AUDITOR';
  };

  const exportToCSV = async () => {
    setIsExporting(true);
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
      const filename = `susupay_report_${reportType.toLowerCase()}_${Date.now()}.csv`;
      a.setAttribute("download", filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setLastExport(filename);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (checkAuthStatus()) {
      setIsAuthorized(true);
      setIsLoading(false);
    } else {
      router.push("/admin");
    }
  }, []);

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
          <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors text-xs font-black uppercase tracking-widest mb-4 group">
            <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Command Center
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase tracking-[0.15em]">
            Financial Audit Hub
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Advanced Reporting & Data Export Console</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full relative z-10 mt-10">
        <div className="glass-card p-10 border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.03] to-transparent shadow-2xl">
          <div className="max-w-xl mx-auto">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 border border-emerald-500/20">
              <LucideFileText size={32} />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Export Data Records</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed">
              Generate comprehensive financial CSV reports for external compliance, 
              local auditing, or performance reviews.
            </p>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Report Category</label>
                <div className="relative">
                  <LucideFilter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 pl-12 pr-10 text-sm font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:border-white/20 transition-all"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="DEPOSIT">Transaction Deposits</option>
                    <option value="WITHDRAWAL">Payout Withdrawals</option>
                    <option value="TRANSFER">Internal Transfers</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={exportToCSV}
                  disabled={isExporting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50"
                >
                  {isExporting ? <LucideLoader className="animate-spin" size={20} /> : <LucideDownload size={20} />}
                  {isExporting ? "Compiling Records..." : `Generate ${reportType} Report`}
                </button>
              </div>

              {lastExport && (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-500 animate-in fade-in zoom-in-95">
                  <LucideCheckCircle size={18} />
                  <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                    Successfully Exported: <span className="text-white ml-1">{lastExport}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all pointer-events-none">
          <div className="glass-card p-6 border-white/5 border-dashed">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Advanced Filtering</h4>
            <p className="text-xs text-slate-600">Region-based metrics and collector-specific filtering (Coming Soon)</p>
          </div>
          <div className="glass-card p-6 border-white/5 border-dashed">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Automated Scheduling</h4>
            <p className="text-xs text-slate-600">Weekly automated report delivery via secure email (Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
