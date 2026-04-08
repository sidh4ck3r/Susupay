"use client";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
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
  
  const isAuthPage = pathname === "/" || pathname?.startsWith("/auth");
  
  // Sidebar is hidden on auth pages. 
  // For other pages, it's shown if the user is authorized for that path.
  // Admins can see the sidebar on all non-auth pages.
  const hideSidebar = isAuthPage || (
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
          <main className={`flex-1 transition-all duration-300 ${!hideSidebar && isReady ? "lg:pl-72" : ""}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
