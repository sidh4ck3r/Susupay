"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideShieldCheck, LucideUser, LucideMapPin, LucideCreditCard, LucideArrowRight, LucideCheckCircle, LucideLoader, LucideLogOut } from "lucide-react";

export default function KYCPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    idType: "GHANA_CARD",
    idNumber: "",
    address: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    
    // Fetch fresh profile to check KYC status
    axios.get(`${API_BASE_URL}/api/auth/profile/${parsedUser.id}`)
      .then(res => {
        setUser(res.data);
        if (res.data.kycStatus === 'VERIFIED') {
          router.push("/dashboard");
        } else if (res.data.kycStatus === 'PENDING') {
          setStep(3); // Show "Waiting for Review" step
        }
      })
      .catch(err => console.error("KYC load error:", err))
      .finally(() => setIsPageLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.put(`${API_BASE_URL}/api/auth/kyc/${user.id}`, formData);
      setStep(3);
      // Update local storage state
      const updatedUser = { ...user, kycStatus: 'PENDING' };
      localStorage.setItem("susupay_user", JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit KYC details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("susupay_user");
    localStorage.removeItem("susupay_token");
    router.push("/auth");
  };

  if (isPageLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-emerald-500">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-[150px] -z-0" />
      
      <button 
        onClick={handleLogout}
        className="fixed top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-white/5 font-bold text-xs uppercase tracking-widest z-50"
      >
        <LucideLogOut size={16} />
        Sign Out
      </button>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6 shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
            <LucideShieldCheck size={36} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase tracking-wider mb-2">Identify <span className="text-emerald-500">Verification</span></h1>
          <p className="text-slate-400 text-sm font-medium">To comply with financial regulations and secure your vault, please complete your profile.</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-12 relative px-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step >= s ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-white/10 text-slate-500'}`}>
                {step > s ? <LucideCheckCircle size={20} /> : s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest mt-3 ${step >= s ? 'text-emerald-500' : 'text-slate-500'}`}>
                {s === 1 ? 'Personal' : s === 2 ? 'Identity' : 'Process'}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-20 right-20 h-0.5 bg-white/5 -z-0" />
          <div className="absolute top-5 left-20 h-0.5 bg-emerald-500 transition-all duration-700 -z-0" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
        </div>

        <div className="glass-card p-10 glow-border shadow-2xl">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <LucideUser size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Full Identity Details</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Verify your full name and Mommo linkage</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Holder</label>
                  <input readOnly disabled value={user?.fullName} className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-4 px-5 text-slate-400 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Momo Provider</label>
                  <input readOnly disabled value={user?.momoProvider} className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-4 px-5 text-slate-400 font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
                <div className="relative">
                  <LucideMapPin className="absolute left-4 top-4 text-slate-500" size={18} />
                  <textarea 
                    placeholder="Enter your complete street address or Digital Address (GPS)..."
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-5 min-h-[100px] outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.address}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 group"
              >
                Continue to Identity
                <LucideArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <LucideCreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Document Verification</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Government issued identification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Document Type</label>
                  <select 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold text-sm"
                    value={formData.idType}
                    onChange={(e) => setFormData({...formData, idType: e.target.value})}
                  >
                    <option value="GHANA_CARD">Ghana Card (National ID)</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVERS_LICENSE">Driver's License</option>
                    <option value="VOTERS_ID">Voter's ID</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identification Number</label>
                  <input 
                    required
                    placeholder="e.g. GHA-123456789-0"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono font-bold"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex gap-4">
                 <LucideShieldCheck className="text-emerald-500 shrink-0 mt-1" size={20} />
                 <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                   <strong className="text-emerald-500">Security Note:</strong> Your identification data is encrypted and used solely for regulatory compliance. We do not share your documents with third parties without your consent.
                 </p>
              </div>

              {error && <p className="text-red-400 text-xs font-bold text-center italic">{error}</p>}

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || !formData.idNumber}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 group"
                >
                  {isLoading ? "Submitting..." : "Submit Verification"}
                  {!isLoading && <LucideCheckCircle size={18} className="group-hover:scale-110 transition-transform" />}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-10 animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-8 animate-pulse shadow-2xl shadow-blue-500/20">
                  <LucideClock size={40} />
               </div>
               <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-4">Under <span className="text-blue-500">Review</span></h3>
               <div className="space-y-4 max-w-sm mx-auto">
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Thank you! Your KYC documents have been submitted securely to our compliance team.
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    Review typically takes 2-4 hours. You will be notified via SMS and Dashboard once your account is activated.
                  </p>
               </div>
               <button 
                onClick={() => router.push("/dashboard")}
                className="mt-10 px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest transition-all border border-white/10"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
