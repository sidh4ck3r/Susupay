"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MomoDeposit from "@/components/MomoDeposit";
import { LucideCoins, LucideLoader } from "lucide-react";

export default function DepositPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("susupay_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    setIsLoading(false);
  }, []);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-emerald-500 bg-[#0a0f1a]">
      <LucideLoader size={48} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen px-6 lg:px-10 pb-10 text-slate-100 bg-[#0a0f1a] relative overflow-hidden">
      {/* Decorative Background Element - Subtle */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] -z-0 pointer-events-none" />

      <header className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center justify-center text-center pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <LucideCoins className="text-emerald-500" size={20} />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase tracking-wider">
            Make a Deposit
          </h1>
        </div>
        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80">
          Add funds to your SusuPay vault via Mobile Money.
        </p>
      </header>

      <div className="max-w-md mx-auto relative z-10 mt-10">
        <MomoDeposit onSuccess={() => router.push("/dashboard")} />
      </div>
    </div>
  );
}
