import { LucideShieldCheck, LucideCoins, LucideTrendingUp, LucideArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-6 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]">
      
      {/* Hero Section */}
      <div className="z-10 text-center max-w-4xl space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-emerald-500/20 text-emerald-400 text-sm font-medium animate-pulse">
          <LucideShieldCheck size={18} />
          <span>Secure Digital Savings Hub</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          SusuPay: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Emerald Glassmorphism</span> Experience
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          Modernizing traditional collection systems for the Ghanaian market with premium visuals and high-fidelity field operations.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/auth">
            <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 group">
              Launch Terminal
              <LucideArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="px-8 py-4 glass-card border-white/10 hover:bg-white/5 text-white rounded-xl font-semibold transition-all">
            View Analytics
          </button>
        </div>
      </div>

      {/* Feature Grids (Visual Only) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 z-10 w-full max-w-5xl">
        <div className="glass-card p-6 glow-border">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
            <LucideCoins size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">MoMo Deposits</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Integrated MTN, Vodafone, and AirtelTigo verification flows.</p>
        </div>

        <div className="glass-card p-6 glow-border">
          <div className="w-12 h-12 bg-sapphire/10 rounded-lg flex items-center justify-center text-blue-500 mb-4">
            <LucideTrendingUp size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Strike Rate Tracking</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Collector consistency metrics with real-time field data syncing.</p>
        </div>

        <div className="glass-card p-6 glow-border border-yellow-500/20 shadow-[0_0_15px_rgba(251,191,36,0.05)]">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-500 mb-4">
            <LucideShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Admin Command</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Secure liquidity management with automated KYC document flagging.</p>
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-0" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-0" />
    </main>
  );
}
