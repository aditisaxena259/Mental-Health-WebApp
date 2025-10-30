// app/login/page-enhanced.tsx
"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { toast } from "sonner";
import { api } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import type { LoginResponse } from "@/types/api";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sparkles,
  Users,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Shield,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const socialProof = [
  { icon: Users, value: "1,200+", label: "Active Users" },
  { icon: CheckCircle, value: "5,000+", label: "Resolved" },
  { icon: Clock, value: "<24h", label: "Response" },
];

const features = [
  { icon: Shield, text: "Secure & Encrypted" },
  { icon: Zap, text: "Lightning Fast" },
  { icon: CheckCircle, text: "24/7 Available" },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Map URL role to internal role: 'warden' -> 'admin', keep 'student' as-is; accept legacy 'admin'
    const roleParam = searchParams.get("role");
    if (roleParam === "warden" || roleParam === "admin") {
      setRole("admin");
    } else if (roleParam === "student") {
      setRole("student");
    } else if (!roleParam) {
      // Ensure the role is always visible in URL; default to student
      const qp = new URLSearchParams(searchParams.toString());
      qp.set("role", "student");
      router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const syncRoleToUrl = (nextRole: "student" | "admin") => {
    setRole(nextRole);
    const qp = new URLSearchParams(searchParams.toString());
    qp.set("role", nextRole === "admin" ? "warden" : "student");
    router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fieldErrors: Record<string, string> = {};
    if (!email.trim()) fieldErrors.email = "Email is required";
    if (!password.trim()) fieldErrors.password = "Password is required";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    setIsLoading(true);

    try {
      const data = await api<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const { token, role: userRole } = data;
      if (!token) {
        throw new Error("Login succeeded but no token returned by server");
      }

      setAuth(token, userRole);

      toast.success(
        `Welcome back, ${userRole === "admin" ? "Warden" : "Student"}!`,
        {
          description: "You've been successfully logged in",
        }
      );

      router.push(
        userRole === "admin" ? "/admin/dashboard" : "/student/dashboard"
      );
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Invalid credentials. Please try again.";
      toast.error("Login failed", {
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        {/* Floating orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
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
          {/* Left side - Branding & Social Proof */}
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
                Welcome Back!
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Sign in to manage your hostel complaints and track resolutions
                in real-time.
              </p>

              {/* Social proof stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {socialProof.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                  >
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.6 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right side - Login Form */}
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
                    {role === "admin" ? "Warden Login" : "Student Login"}
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
                  Enter your credentials to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={
                        role === "admin" ? "you@hostel.com" : "you@uni.com"
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                      autoComplete="email"
                    />
                    <p className="text-xs text-muted-foreground">
                      {role === "admin"
                        ? "Use your @hostel.com email"
                        : "Use your @uni.com email"}
                    </p>
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember me checkbox removed per request */}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="text-sm text-center text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/signup?role=${
                      role === "admin" ? "warden" : "student"
                    }`}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Create one
                  </Link>
                </div>

                {/* Mobile social proof */}
                <div className="lg:hidden grid grid-cols-3 gap-2 w-full">
                  {socialProof.map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center p-2 rounded-lg bg-muted/50"
                    >
                      <div className="text-sm font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
