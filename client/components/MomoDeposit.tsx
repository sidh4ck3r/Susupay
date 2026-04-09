"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { LucideSmartphone, LucideCheckCircle, LucideAlertCircle, LucideArrowRight, LucideCreditCard } from "lucide-react";
import { API_BASE_URL } from "@/app/constants";

const PROVIDERS = [
  { id: 'MTN', name: 'MTN Mobile Money', icon: '/mtn-momo.png', color: 'bg-yellow-400' },
  { id: 'VODAFONE', name: 'Telecel (Vodafone)', icon: '/telecel.png', color: 'bg-red-600' },
  { id: 'AIRTELTIGO', name: 'AT (AirtelTigo)', icon: '/at.png', color: 'bg-blue-600' },
];

interface MomoDepositProps {
  onSuccess?: () => void;
  initialAmount?: string;
  initialProvider?: string;
  groupId?: string;
}

export default function MomoDeposit({ onSuccess, initialAmount, initialProvider, groupId }: MomoDepositProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(initialAmount || "");
  const [provider, setProvider] = useState(initialProvider || "");
  const [momoNumber, setMomoNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step Activation Logic: Detect if returning from a successful payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    
    if (reference) {
      setStep(2); // Show processing
      setIsLoading(true);
      
      // Verify the transaction with our backend
      axios.get(`${API_BASE_URL}/api/transactions/verify/${reference}`)
        .then(res => {
          console.log("✅ Transaction verified:", res.data);
          setStep(3); // Success
        })
        .catch(err => {
          console.error("❌ Verification failed:", err);
          setError("We couldn't verify your transaction automatically. Please contact support if your balance hasn't updated.");
          setStep(1);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const handleInitiate = async () => {
    setIsLoading(true);
    setError("");

    try {
      const storedUser = localStorage.getItem("susupay_user");
      if (!storedUser) throw new Error("Please log in to make a deposit.");
      
      const user = JSON.parse(storedUser);

      // 1. KYC Check (Frontend enforcement)
      if (user.kycStatus !== 'VERIFIED') {
        setError("KYC Verification Required: Please complete your identity verification in the KYC section before making a deposit.");
        setIsLoading(false);
        return;
      }

      const reference = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Visually move to step 2 (Processing)
      setStep(2);

      // Real API Call to Backend
      const response = await axios.post(`${API_BASE_URL}/api/transactions/deposit`, {
        userId: user.id,
        amount,
        provider,
        momoNumber,
        reference,
        groupId // Tag this deposit for a specific Susu circle
      });

      // Redirect to Paystack Checkout
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error("Failed to get payment link. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      setIsLoading(false);
      setStep(1); // Revert to step 1 on error
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 p-1">
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${step >= 1 ? 'bg-emerald-500 text-white' : 'glass-card text-slate-500'}`}>1</div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${step >= 2 ? 'bg-emerald-500 text-white' : 'glass-card text-slate-500'}`}>2</div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${step >= 3 ? 'bg-emerald-500 text-white' : 'glass-card text-slate-500'}`}>3</div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
        <div className={`absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-500`} style={{ width: `${(step - 1) * 50}%` }} />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <LucideAlertCircle size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {step === 1 && (
        <div className="glass-card p-8 glow-border space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Initiate MoMo Deposit</h2>
            <p className="text-slate-400 text-sm">Select your provider and enter amount to save.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${provider === p.id ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-950/40 border-white/5 hover:border-white/10'}`}
              >
                <div className={`w-10 h-10 rounded-lg ${p.color} flex items-center justify-center text-white font-bold text-xs font-mono`}>
                  {p.id[0]}
                </div>
                <span className="font-medium">{p.name}</span>
                {provider === p.id && <LucideCheckCircle className="ml-auto text-emerald-500" size={20} />}
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Amount (GHS)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">₵</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-mono"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">MoMo Number</label>
              <div className="relative">
                <LucideSmartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="tel" 
                  placeholder="054XXXXXXX"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-mono"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            disabled={!amount || !provider || !momoNumber || isLoading}
            onClick={handleInitiate}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group mt-4"
          >
            {isLoading ? "Connecting to Provider..." : "Secure Deposit"}
            {!isLoading && <LucideArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="glass-card p-10 glow-border text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto animate-bounce border border-emerald-500/20">
            <LucideSmartphone size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Check Your Phone</h2>
            <p className="text-slate-400">A prompt has been sent to <span className="text-white font-medium font-mono">{momoNumber}</span>. Please enter your MoMo PIN to authorize the ₵{amount} deposit.</p>
          </div>
          <div className="pt-4">
             <button onClick={() => setStep(3)} className="text-emerald-400 text-sm font-medium hover:underline">I have completed the payment</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card p-10 glow-border text-center space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <LucideCheckCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Deposit Successful!</h2>
            <p className="text-slate-400">Your savings balance has been updated. ₵{amount} has been securely added to your SusuPay vault.</p>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep(1)} className="flex-1 py-3 glass-card hover:bg-white/5 rounded-xl font-medium transition-all">Back to Dashboard</button>
            <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
              <LucideCreditCard size={18} />
              View Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
