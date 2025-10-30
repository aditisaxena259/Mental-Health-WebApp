"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

type Role = "student" | "admin";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // read role from URL, accept warden/admin, default to student and keep it visible in the URL
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "warden" || roleParam === "admin") {
      setRole("admin");
    } else if (roleParam === "student") {
      setRole("student");
    } else if (!roleParam) {
      const qp = new URLSearchParams(searchParams.toString());
      qp.set("role", "student");
      router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const syncRoleToUrl = (nextRole: Role) => {
    setRole(nextRole);
    const qp = new URLSearchParams(searchParams.toString());
    qp.set("role", nextRole === "admin" ? "warden" : "student");
    router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
  };

  const emailHint = useMemo(
    () =>
      role === "admin"
        ? "Use your @hostel.com email"
        : "Use your @uni.com email",
    [role]
  );

  const validate = () => {
    const fieldErrors: Record<string, string> = {};
    if (!email.trim()) fieldErrors.email = "Email is required";
    if (email && role === "admin" && !email.endsWith("@hostel.com")) {
      fieldErrors.email = "Warden email must end with @hostel.com";
    }
    if (email && role === "student" && !email.endsWith("@uni.com")) {
      fieldErrors.email = "Student email must end with @uni.com";
    }
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      await api("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });

      toast.success("If the email exists, a reset token has been sent");
      router.push("/reset-password/sent");
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to send reset link. Please try again.";
      toast.error("Request failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block space-y-8"
          >
            <Link href="/">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Sparkles className="text-white w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    HostelCare
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Modern Hostel Management
                  </p>
                </div>
              </div>
            </Link>

            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Reset your password
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Enter your account email and we will send a secure link to reset
                your password.
              </p>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-2 shadow-2xl">
              <CardHeader className="space-y-1">
                {/* Mobile logo */}
                <div className="lg:hidden flex justify-center mb-4">
                  <Link href="/">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="text-white w-5 h-5" />
                      </div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        HostelCare
                      </h1>
                    </div>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    Forgot Password
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  >
                    {role === "admin" ? "Warden" : "Student"}
                  </Badge>
                </div>

                {/* Role selector */}
                <div className="mt-2">
                  <div className="inline-flex rounded-lg border bg-muted/40 p-1">
                    <button
                      type="button"
                      onClick={() => syncRoleToUrl("student")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        role === "student"
                          ? "bg-background shadow border"
                          : "text-muted-foreground"
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => syncRoleToUrl("admin")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        role === "admin"
                          ? "bg-background shadow border"
                          : "text-muted-foreground"
                      }`}
                    >
                      Warden
                    </button>
                  </div>
                </div>

                <CardDescription>
                  We will email you a secure reset link
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={
                          role === "admin" ? "you@hostel.com" : "you@uni.com"
                        }
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        autoComplete="email"
                        aria-label="Email address"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{emailHint}</p>
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="text-sm text-center text-muted-foreground">
                    Remember your password?{" "}
                    <Link
                      href={`/login?role=${
                        role === "admin" ? "warden" : "student"
                      }`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Sign in
                    </Link>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Link
                    href={`/login?role=${
                      role === "admin" ? "warden" : "student"
                    }`}
                    className="flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
