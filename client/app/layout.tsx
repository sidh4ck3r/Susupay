"use client";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
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

      // KYC Redirect Guard
      const isDashboardRoute = pathname?.startsWith("/dashboard");
      const isRestrictedRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/collector") || isDashboardRoute;
      const isAuthOrKycPage = pathname === "/" || pathname?.startsWith("/auth") || pathname === "/kyc";

      if (user.kycStatus === 'UNVERIFIED' && isRestrictedRoute && !isAuthOrKycPage) {
        console.log("🔒 KYC Required: Redirecting to verification.");
        router.push("/kyc");
      }
    } else {
      setIsAdmin(false);
      setIsCollector(false);
      setIsAuditor(false);
    }
    setIsReady(true);
  }, [pathname, router]);
  
  const isAuthPage = pathname === "/" || pathname?.startsWith("/auth");
  const isKycPage = pathname === "/kyc";
  
  // Sidebar is hidden on auth and kyc pages. 
  // For other pages, it's shown if the user is authorized for that path.
  const hideSidebar = isAuthPage || isKycPage || (
    (!isAdmin && !isAuditor) && (
      (pathname?.startsWith("/admin")) ||
      (pathname?.startsWith("/collector") && !isCollector)
    )
  );

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500/30">
        <div className="flex flex-col lg:flex-row min-h-screen">
          <Sidebar />
          <main className={`flex-1 transition-all duration-300 relative z-[90] ${!hideSidebar && isReady ? "lg:pl-72" : ""}`}>
            {isReady ? (
              children
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0a0f1a]">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            )}
          </main>
        </div>
      </body>
    </html>
  );
}
