"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LucideLayoutGrid, 
  LucideUsers, 
  LucideTrendingUp, 
  LucidePlusCircle, 
  LucideHistory, 
  LucideArrowUpRight, 
  LucideLogOut,
  LucideMenu,
  LucideX,
  LucideSmartphone
} from "lucide-react";
import { useState, useEffect } from "react";

const menuItems = [
  { name: "Dashboard", icon: LucideLayoutGrid, href: "/dashboard" },
  { name: "Group Susu", icon: LucideUsers, href: "/groups" },
  { name: "Savings Goals", icon: LucideTrendingUp, href: "/savings" },
  { name: "Deposit", icon: LucidePlusCircle, href: "/deposit" },
  { name: "Transactions", icon: LucideHistory, href: "/transactions" },
  { name: "Withdrawals", icon: LucideArrowUpRight, href: "/withdrawals" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCollector, setIsCollector] = useState(false);
  const [isAuditor, setIsAuditor] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("susupay_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsAdmin(user.role === 'ADMIN');
      setIsCollector(user.role === 'COLLECTOR');
      setIsAuditor(user.role === 'AUDITOR');
    } else {
      setIsAdmin(false);
      setIsCollector(false);
      setIsAuditor(false);
    }
    setIsReady(true);
  }, [pathname]);

  // Don't show sidebar on auth pages or home page
  if (pathname === "/" || pathname?.startsWith("/auth")) {
    return null;
  }

  // Administrators see the sidebar everywhere except auth pages
  if (isAdmin || isAuditor) {
    if (!isReady) return null;
    // Show sidebar!
  } else if (isCollector) {
    if (!isReady) return null;
    // Show sidebar on collector and common pages
  } else if (pathname?.startsWith("/admin") || pathname?.startsWith("/collector")) {
    // Non-authorized access to special paths: hide sidebar
    return null;
  }

  // Wait for initial ready check before rendering
  if (!isReady) return null;

  const handleLogout = () => {
    localStorage.removeItem("susupay_user");
    localStorage.removeItem("susupay_token");
    window.location.href = "/auth";
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-2 glass-card border-white/10 text-emerald-500 shadow-xl"
      >
        {isOpen ? <LucideX size={24} /> : <LucideMenu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 
        bg-[#0a0f1a]/80 backdrop-blur-xl border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <LucideLayoutGrid className="text-emerald-500" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">SusuPay</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {/* Field Terminal and Admin Panel moved to top */}
            {(isCollector || isAdmin) && (
              <Link 
                href="/collector"
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all group
                  ${pathname === "/collector" 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "text-slate-400 hover:text-emerald-400 hover:bg-white/5 border border-transparent"}
                `}
              >
                <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                   <LucideSmartphone size={18} className="text-emerald-500" />
                </div>
                Field Terminal
              </Link>
            )}

            {(isAdmin || isAuditor) && (
              <Link 
                href="/admin"
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all group border border-transparent
                  ${pathname === "/admin" 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "text-slate-400 hover:text-emerald-400 hover:bg-white/5"}
                `}
              >
                <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                   <LucideUsers size={18} className="text-blue-500" />
                </div>
                {isAuditor ? "Audit Panel" : "Admin Panel"}
              </Link>
            )}

            {/* Separator if admin/collector/auditor links were present */}
            {(isCollector || isAdmin || isAuditor) && <div className="border-t border-white/5 my-4 pt-4" />}

            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all group
                    ${isActive 
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                      : "text-slate-400 hover:text-emerald-400 hover:bg-white/5 border border-transparent"}
                  `}
                >
                  <item.icon size={20} className={`${isActive ? "text-emerald-500" : "group-hover:text-emerald-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-6 mt-auto border-t border-white/5 space-y-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group border border-transparent"
            >
              <LucideLogOut size={20} className="group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center px-4">
               Authorized Terminal
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
