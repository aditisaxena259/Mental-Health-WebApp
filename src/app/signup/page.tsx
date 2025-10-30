"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordStrength } from "@/components/ui/password-strength";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { api } from "@/lib/api";
import type { Role } from "@/types/api";

import { Sparkles, Eye, EyeOff, Building2, School } from "lucide-react";

type SignupRole = Extract<Role, "student" | "admin">;

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [role, setRole] = useState<SignupRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Admin fields
  const [block, setBlock] = useState("");
  // Student fields
  const [hostel, setHostel] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [studentId, setStudentId] = useState("");

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

  const syncRoleToUrl = (nextRole: SignupRole) => {
    setRole(nextRole);
    const qp = new URLSearchParams(searchParams.toString());
    qp.set("role", nextRole === "admin" ? "warden" : "student");
    router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
  };

  const emailHint = useMemo(() => {
    return role === "admin"
      ? "Use your @hostel.com email"
      : "Use your @uni.com email";
  }, [role]);

  const validateForm = (): boolean => {
    const fieldErrors: Record<string, string> = {};
    if (!name.trim()) fieldErrors.name = "Name is required";
    if (!email.trim()) fieldErrors.email = "Email is required";
    if (!password.trim()) {
      fieldErrors.password = "Password is required";
    } else {
      // Validate password strength
      const hasLength = password.length >= 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);

      if (!hasLength || !hasUppercase || !hasNumber || !hasSpecial) {
        fieldErrors.password = "Password must meet all strength requirements";
      }
    }

    if (!confirmPassword.trim()) {
      fieldErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match";
    }

    if (role === "admin") {
      if (email && !email.endsWith("@hostel.com")) {
        fieldErrors.email = "Warden email must end with @hostel.com";
      }
      if (!block.trim()) fieldErrors.block = "Hostel block is required";
    } else {
      if (email && !email.endsWith("@uni.com")) {
        fieldErrors.email = "Student email must end with @uni.com";
      }
      if (!hostel.trim()) {
        fieldErrors.hostel = "Hostel is required";
      }
      if (!roomNo.trim()) {
        fieldErrors.roomNo = "Room number is required";
      } else if (!/^[A-Z]-\d{3}$/.test(roomNo)) {
        fieldErrors.roomNo =
          "Room number must be in format L-204 (Letter-3digits)";
      }
      if (!studentId.trim()) {
        fieldErrors.studentId = "Student ID is required";
      } else if (!/^\d{2}[A-Z]{3}\d{4}$/.test(studentId)) {
        fieldErrors.studentId =
          "Student ID must be in format 22BCE2210 (2digits-3letters-4digits)";
      }
    }

    if (!agreeTos) fieldErrors.tos = "You must agree to continue";

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Build payload in backend-expected shape
      const payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      if (role === "admin") {
        payload.block = block.trim();
      } else {
        // Student fields - all required by spec
        payload.hostel = hostel.trim();
        payload.room_no = roomNo.trim();
        payload.student_id = studentId.trim();
      }

      console.log("Signup payload:", JSON.stringify(payload, null, 2));

      await api<unknown>("/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Account created", {
        description: "You can now sign in with your credentials",
      });
      router.push(`/login?role=${role === "admin" ? "warden" : "student"}`);
    } catch (error) {
      console.error("Signup error:", error);
      const msg = error instanceof Error ? error.message : "Signup failed";
      toast.error("Could not create account", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background (mirrors login) */}
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
          {/* Left side - Brand */}
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
                Create your account
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Sign up as a student or warden to manage complaints and track
                resolutions seamlessly.
              </p>

              {/* Dynamic email instruction based on role */}
              {role === "student" ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium">Students</div>
                    <div className="text-xs text-muted-foreground">
                      Use your @uni.com email
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="font-medium">Wardens</div>
                    <div className="text-xs text-muted-foreground">
                      Use your @hostel.com email
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right side - Signup Form */}
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
                    {role === "admin" ? "Warden Sign Up" : "Student Sign Up"}
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
                  Create your account to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                        autoComplete="name"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600">{errors.name}</p>
                      )}
                    </div>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {emailHint}
                      </p>
                      {errors.email && (
                        <p className="text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10"
                        autoComplete="new-password"
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
                    <PasswordStrength password={password} />
                    {errors.password && (
                      <p className="text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Role-specific fields */}
                  {role === "admin" ? (
                    <div className="space-y-2">
                      <Label htmlFor="block">
                        Hostel Block <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="block"
                        placeholder="e.g., A, B, C..."
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the block you oversee
                      </p>
                      {errors.block && (
                        <p className="text-xs text-red-600">{errors.block}</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hostel">
                          Hostel <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="hostel"
                          placeholder="e.g., Redwood"
                          value={hostel}
                          onChange={(e) => setHostel(e.target.value)}
                          className="h-11"
                        />
                        {errors.hostel && (
                          <p className="text-xs text-red-600">
                            {errors.hostel}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roomNo">
                          Room No <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="roomNo"
                          placeholder="e.g., B-204"
                          value={roomNo}
                          onChange={(e) => setRoomNo(e.target.value)}
                          className="h-11"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your room number
                        </p>
                        {errors.roomNo && (
                          <p className="text-xs text-red-600">
                            {errors.roomNo}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">
                          Student ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="studentId"
                          placeholder="e.g., 22BCE2210"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="h-11"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your student ID
                        </p>
                        {errors.studentId && (
                          <p className="text-xs text-red-600">
                            {errors.studentId}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tos"
                      checked={agreeTos}
                      onCheckedChange={(checked: boolean) =>
                        setAgreeTos(!!checked)
                      }
                    />
                    <label
                      htmlFor="tos"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      I agree to the <span className="underline">Terms</span>{" "}
                      and <span className="underline">Privacy</span>{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {errors.tos && (
                      <p className="text-xs text-red-600 ml-2">{errors.tos}</p>
                    )}
                  </div>

                  <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href={`/login?role=${
                        role === "admin" ? "warden" : "student"
                      }`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Sign in
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
