"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { LucideLoader } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically parses the URL hash/query block
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session) throw new Error("No active session found after redirect.");

        // We have the Supabase session! Let's sync this user with our MariaDB backend.
        const user = session.user;
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Google User";
        const email = user.email;
        const googleId = user.id; // Supabase user ID acts as our unique provider ID
        const picture = user.user_metadata?.avatar_url;

        // Send to backend to log them in or create an account
        const syncUrl = `${API_BASE_URL}/api/auth/supabase`;
        console.log("Syncing with backend at:", syncUrl);
        const response = await axios.post(syncUrl, {
          googleId, // Mapping supabase UUID as googleId in our existing system
          email,
          name: fullName,
          picture
        });

        localStorage.setItem("susupay_token", response.data.token);
        localStorage.setItem("susupay_user", JSON.stringify(response.data.user));
        
        // Redirect logic managed by layout/auth flow (Check KYC status, etc)
        const userData = response.data.user;
        if (userData.role === 'ADMIN' || userData.role === 'AUDITOR') {
          router.push("/admin");
        } else if (userData.role === 'COLLECTOR') {
          router.push("/collector");
        } else {
          router.push("/dashboard");
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to sync authentication.";
        setError(`${errorMsg} Redirecting...`);
        setTimeout(() => router.push("/auth"), 5000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center text-emerald-500">
      <LucideLoader size={48} className="animate-spin mb-4" />
      <h2 className="text-white text-xl font-bold tracking-widest uppercase">Securing Connection...</h2>
      {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
    </div>
  );
}
