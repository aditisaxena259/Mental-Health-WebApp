"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/guard/RequireAuth";
import { api } from "@/lib/api";
import { clearAuth, getToken } from "@/lib/auth";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, ArrowLeft } from "lucide-react";

function StudentProfileInner() {
  const router = useRouter();
  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );
  const [studentInfo, setStudentInfo] = useState({
    name: "Student",
    id: "",
    room: "",
    block: "",
    floor: "",
    course: "",
    year: "",
    avatar: "/avatars/student.svg",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch student profile from /student/profile
  useEffect(() => {
    if (!token) return;
    setLoadingProfile(true);
    api("/student/profile", { method: "GET" }, token)
      .then((data) => {
        setStudentInfo({
          name: data.name || "Student",
          id: data.studentIdentifier || data.id || "",
          room: data.roomNo || data.room_no || data.room || "",
          block: data.block || data.hostel || "",
          floor: data.floor || "",
          course: data.course || "",
          year: data.year || "",
          avatar: data.avatar || "/avatars/student.svg",
        });
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
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

  if (loadingProfile) {
    return (
      <RequireAuth roles={["student"]}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth roles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="pl-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>

          <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl mb-6">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={studentInfo.avatar} alt={studentInfo.name} />
                <AvatarFallback>{studentInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{studentInfo.name}</CardTitle>
                <CardDescription>{studentInfo.course}</CardDescription>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">Student</Badge>
                  <Badge variant="outline">{studentInfo.year}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="font-medium">{studentInfo.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room</p>
                  <p className="font-medium">
                    {studentInfo.room}, {studentInfo.block}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Floor</p>
                  <p className="font-medium">{studentInfo.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">{studentInfo.course}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your hostel experience</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/student/complaints">
                <Button variant="outline" className="w-full justify-start">
                  View My Complaints
                </Button>
              </Link>
              <Link href="/student/apologies">
                <Button variant="outline" className="w-full justify-start">
                  View My Apologies
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentProfileInner />
    </Suspense>
  );
}
