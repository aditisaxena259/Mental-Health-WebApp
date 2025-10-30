"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState, useEffect } from "react";
import RequireAuth from "@/components/guard/RequireAuth";
import { api } from "@/lib/api";
import { clearAuth, getToken } from "@/lib/auth";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, ArrowLeft } from "lucide-react";

function AdminProfileInner() {
  const router = useRouter();
  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );
  const [adminInfo, setAdminInfo] = useState({
    name: "Admin",
    roleTitle: "Warden",
    email: "",
    avatar: "/avatars/warden.svg",
  });

  // TODO: API - Fetch admin profile from backend
  useEffect(() => {
    if (!token) return;
    // api("/profile", { method: "GET" }, token)
    //   .then((data) => {
    //     setAdminInfo({
    //       name: data.name || "Admin",
    //       roleTitle: data.role_title || data.roleTitle || "Warden",
    //       email: data.email || "",
    //       avatar: data.avatar || "/avatars/warden.svg",
    //     });
    //   })
    //   .catch(() => {});
  }, [token]);

  const logout = async () => {
    try {
      await api("/logout", { method: "POST" }, token || undefined);
      clearAuth();
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Logout failed. Please try again later.");
    }
  };

  return (
    <RequireAuth roles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="pl-0 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900 dark:hover:to-purple-900 transition-all rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="rounded-xl border-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950 dark:hover:to-pink-950 transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>

          <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 mb-6">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-1 rounded-2xl shadow-md">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={adminInfo.avatar} alt={adminInfo.name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                    {adminInfo.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {adminInfo.name}
                </CardTitle>
                <CardDescription>{adminInfo.roleTitle}</CardDescription>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="rounded-lg border-2">
                    Admin
                  </Badge>
                  <Badge variant="outline" className="rounded-lg border-2">
                    {adminInfo.email}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Responsibilities
                  </p>
                  <p className="font-semibold text-foreground">
                    Complaints Management
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Access
                  </p>
                  <p className="font-semibold text-foreground">
                    Admin Dashboard & Apologies Review
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Account
                </CardTitle>
                <CardDescription>Manage your session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-2 rounded-lg">
                      <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span>Logged in as Admin</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="rounded-xl border-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950 dark:hover:to-pink-950 transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Quick Links
                </CardTitle>
                <CardDescription>Navigate across admin tools</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="justify-start rounded-xl border-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950 dark:hover:to-purple-950 transition-all"
                >
                  <Link href="/admin/dashboard">Admin Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

export default function AdminProfilePage() {
  return (
    <Suspense fallback={null}>
      <AdminProfileInner />
    </Suspense>
  );
}
