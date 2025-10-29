"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
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

const ADMIN_INFO = {
  name: "Dr. Sunita Walia",
  roleTitle: "Head Warden",
  email: "warden@university.edu",
  avatar: "/avatars/warden.svg",
};

function AdminProfileInner() {
  const router = useRouter();
  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/complaint_dashboard"
              className="text-gray-600 hover:text-indigo-700 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Link>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={ADMIN_INFO.avatar} alt={ADMIN_INFO.name} />
                <AvatarFallback>{ADMIN_INFO.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{ADMIN_INFO.name}</CardTitle>
                <CardDescription>{ADMIN_INFO.roleTitle}</CardDescription>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">Admin</Badge>
                  <Badge variant="outline">{ADMIN_INFO.email}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Responsibilities</p>
                  <p className="font-medium">Complaints Management</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Access</p>
                  <p className="font-medium">
                    Admin Dashboard & Apologies Review
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span>Logged in as Admin</span>
                  </div>
                  <Button variant="outline" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Navigate across admin tools</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/complaint_dashboard">Complaints Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/apologies_dashboard">Apologies Dashboard</Link>
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
