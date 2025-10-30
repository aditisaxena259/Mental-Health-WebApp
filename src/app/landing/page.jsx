"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * DEPRECATED: Landing page has been replaced by unified /admin/dashboard
 * Redirecting to the new admin dashboard
 */
export default function LandingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Redirecting...
        </h1>
        <p className="text-gray-600">Taking you to the admin dashboard</p>
      </div>
    </div>
  );
}

