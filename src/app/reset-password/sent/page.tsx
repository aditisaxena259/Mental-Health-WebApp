"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Sparkles, ArrowLeft } from "lucide-react";

export default function ResetSentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const roleParam = searchParams.get("role");
  const email = searchParams.get("email") || "";

  const internalRole =
    roleParam === "warden" || roleParam === "admin" ? "admin" : "student";
  const urlRole = internalRole === "admin" ? "warden" : "student";

  // Ensure role is visible in URL
  useEffect(() => {
    if (!roleParam) {
      const qp = new URLSearchParams(searchParams.toString());
      qp.set("role", "student");
      router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
    }
  }, [roleParam, pathname, router, searchParams]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full blur-3xl opacity-30"
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-2 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <Sparkles className="text-white w-5 h-5" />
                  </div>
                  <CardTitle className="text-2xl">Check your inbox</CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                >
                  {internalRole === "admin" ? "Warden" : "Student"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-foreground">
                  If an account exists for{" "}
                  <span className="font-semibold">{email}</span>
                  {", a password reset link was sent."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check your inbox and spam folder.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Link
                href={`/login?role=${urlRole}`}
                className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
              <Link
                href={`/forgot-password?role=${urlRole}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                Use a different email
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
