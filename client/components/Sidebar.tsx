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
  LucideSmartphone,
  LucideBell
} from "lucide-react";
import { useState, useEffect } from "react";

const menuItems = [
  { name: "Dashboard", icon: LucideLayoutGrid, href: "/dashboard" },
  { name: "Group Susu", icon: LucideUsers, href: "/dashboard/groups" },
  { name: "Savings Goals", icon: LucideTrendingUp, href: "/dashboard/savings" },
  { name: "Deposit", icon: LucidePlusCircle, href: "/dashboard/deposit" },
  { name: "Transactions", icon: LucideHistory, href: "/dashboard/transactions" },
  { name: "Withdrawals", icon: LucideArrowUpRight, href: "/dashboard/withdrawals" },
  { name: "Notifications", icon: LucideBell, href: "/dashboard/notifications" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCollector, setIsCollector] = useState(false);
  const [isAuditor, setIsAuditor] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("susupay_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === 'ADMIN');
      setIsCollector(parsedUser.role === 'COLLECTOR');
      setIsAuditor(parsedUser.role === 'AUDITOR');
    } else {
      setIsAdmin(false);
      setIsCollector(false);
      setIsAuditor(false);
      setUser(null);
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
        className="lg:hidden fixed top-6 left-6 z-[600] p-2 glass-card border-white/10 text-emerald-500 shadow-xl"
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
                  ${pathname === "/collector" || pathname?.startsWith("/collector/")
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
                  ${pathname === "/admin" || pathname?.startsWith("/admin/")
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

            {menuItems.filter(item => {
              if (item.name === "Notifications") {
                // Return true ONLY for verified users or core staff
                const status = user?.kycStatus;
                return (isAdmin || isAuditor) || (status === 'VERIFIED');
              }
              return true;
            }).map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));
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

          {/* Bottom Profile & Actions */}
          <div className="pt-6 mt-auto border-t border-white/5 space-y-4">
            {user && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black border border-emerald-500/20">
                  {user.fullName?.[0] || "U"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{user.role}</p>
                </div>
              </div>
            )}

            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all group border border-transparent shadow-[0_0_15px_rgba(239,68,68,0.02)]"
            >
              <LucideLogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
