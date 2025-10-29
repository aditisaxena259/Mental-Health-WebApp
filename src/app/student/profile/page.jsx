"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, ArrowLeft } from "lucide-react";

const STUDENT_INFO = {
  name: "Aisha Khan",
  id: "23BCE2139",
  room: "203",
  block: "A Block",
  floor: "2nd Floor",
  course: "B.Tech, Computer Science",
  year: "3rd Year",
  avatar: "/avatars/student.svg",
};

function StudentProfileInner() {
  const router = useRouter();
  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("student_id");
      if (saved) setStudentId(saved);
    }
  }, []);

  const saveStudentId = () => {
    if (!studentId) {
      toast.error("Please enter your Student ID (UUID)");
      return;
    }
    localStorage.setItem("student_id", studentId);
    toast.success("Student ID saved");
  };

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
    <RequireAuth roles={["student"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link
                href="/student/dashboard"
                className="text-gray-600 hover:text-indigo-700 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={STUDENT_INFO.avatar}
                  alt={STUDENT_INFO.name}
                />
                <AvatarFallback>{STUDENT_INFO.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{STUDENT_INFO.name}</CardTitle>
                <CardDescription>
                  {STUDENT_INFO.course} • {STUDENT_INFO.year}
                </CardDescription>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">ID: {STUDENT_INFO.id}</Badge>
                  <Badge variant="outline">Room: {STUDENT_INFO.room}</Badge>
                  <Badge variant="outline">{STUDENT_INFO.block}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Floor</Label>
                  <p className="font-medium">{STUDENT_INFO.floor}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Program</Label>
                  <p className="font-medium">{STUDENT_INFO.course}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Year</Label>
                  <p className="font-medium">{STUDENT_INFO.year}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student ID (UUID)</CardTitle>
                <CardDescription>
                  Saved locally for submissions like apologies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your Student ID (UUID)"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                  <Button onClick={saveStudentId}>Save</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span>Logged in as Student</span>
                  </div>
                  <Button variant="outline" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={null}>
      <StudentProfileInner />
    </Suspense>
  );
}
