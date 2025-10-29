"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/guard/RequireAuth";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle, AlertCircle, Clock } from "lucide-react";

const APOLOGY_TYPES = [
  { id: "outing", name: "Outing" },
  { id: "misconduct", name: "Misconduct" },
  { id: "miscellaneous", name: "Miscellaneous" },
];

const STATUS_BADGE = (status) => {
  switch (status) {
    case "accepted":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Rejected
        </Badge>
      );
    case "reviewed":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          Reviewed
        </Badge>
      );
    case "submitted":
    default:
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          Submitted
        </Badge>
      );
  }
};

function StudentApologiesInner() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [apologies, setApologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ type: "", message: "", description: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("student_id");
      if (saved) setStudentId(saved);
    }
  }, []);

  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );

  const fetchApologies = async () => {
    if (!token) return;
    if (!studentId) return;
    setLoading(true);
    try {
      const data = await api(
        `/student/apologies?student_id=${encodeURIComponent(studentId)}`,
        { method: "GET" },
        token
      );
      setApologies(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch apologies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApologies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const saveStudentId = () => {
    if (!studentId) {
      toast.error("Please enter your Student ID (UUID)");
      return;
    }
    localStorage.setItem("student_id", studentId);
    toast.success("Student ID saved");
    fetchApologies();
  };

  const submitApology = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!studentId) {
      toast.error("Student ID required");
      return;
    }
    try {
      await api(
        "/student/apologies",
        {
          method: "POST",
          body: JSON.stringify({
            student_id: studentId,
            type: form.type,
            message: form.message,
            description: form.description || undefined,
          }),
        },
        token
      );
      toast.success("Apology letter submitted successfully");
      setNewOpen(false);
      setForm({ type: "", message: "", description: "" });
      fetchApologies();
    } catch (e) {
      toast.error(e?.message || "Failed to submit apology");
    }
  };

  return (
    <RequireAuth roles={["student"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Apologies</h1>
              <p className="text-gray-600">
                Submit and track your apology letters
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={newOpen} onOpenChange={setNewOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Submit Apology
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px] bg-white">
                  <form onSubmit={submitApology}>
                    <DialogHeader>
                      <DialogTitle>Submit a New Apology</DialogTitle>
                      <DialogDescription>
                        Provide details for your apology letter.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="student_id">Student ID (UUID)</Label>
                        <Input
                          id="student_id"
                          placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Saved locally for future submissions.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={form.type}
                          onValueChange={(v) =>
                            setForm((f) => ({ ...f, type: v }))
                          }
                          required
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {APOLOGY_TYPES.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Input
                          id="message"
                          value={form.message}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, message: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Description (optional)
                        </Label>
                        <Textarea
                          id="description"
                          rows={4}
                          value={form.description}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNewOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Submit</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Student ID</CardTitle>
              <CardDescription>
                Required to fetch and submit apologies
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Enter your Student ID (UUID)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
              <Button variant="outline" onClick={saveStudentId}>
                Save
              </Button>
              <Button onClick={fetchApologies} disabled={!studentId}>
                Refresh
              </Button>
            </CardContent>
          </Card>

          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              Loading...
            </div>
          ) : apologies.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No apologies found
              </h3>
              <p className="text-gray-600 mb-4">
                {studentId
                  ? "You haven't submitted any apologies yet"
                  : "Enter your Student ID to view apologies"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apologies.map((ap) => (
                <div
                  key={ap.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center capitalize">
                          {ap.type?.[0] ?? "A"}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {ap.type}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              ap.created_at ?? ap.date ?? Date.now()
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>{STATUS_BADGE(ap.status)}</div>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 font-medium">
                      {ap.message}
                    </p>
                    {ap.description ? (
                      <p className="text-sm text-gray-600">{ap.description}</p>
                    ) : null}
                    {ap.comment ? (
                      <p className="text-xs text-gray-500 mt-2">
                        Admin comment: {ap.comment}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

export default function StudentApologiesPage() {
  return (
    <Suspense fallback={null}>
      <StudentApologiesInner />
    </Suspense>
  );
}
