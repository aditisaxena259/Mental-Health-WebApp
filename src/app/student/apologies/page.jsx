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
import {
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Paperclip,
} from "lucide-react";

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
  const [apologies, setApologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ type: "", message: "", description: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );

  const fetchApologies = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api("/student/apologies", { method: "GET" }, token);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setApologies(list);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch apologies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApologies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    // Validate file type - PDF or images
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const submitApology = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      // TODO: API - Backend should auto-associate with authenticated user
      await api(
        "/student/apologies",
        {
          method: "POST",
          body: JSON.stringify({
            type: form.type,
            message: form.message,
            description: form.description || undefined,
          }),
        },
        token
      );

      if (selectedFile) {
        console.log("TODO: Upload apology file to backend:", selectedFile.name);
        // TODO: Implement file upload endpoint when available
      }

      toast.success("Apology letter submitted successfully");
      setNewOpen(false);
      setForm({ type: "", message: "", description: "" });
      setSelectedFile(null);
      fetchApologies();
    } catch (e) {
      toast.error(e?.message || "Failed to submit apology");
    }
  };

  return (
    <RequireAuth roles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                My Apologies
              </h1>
              <p className="text-gray-600">
                Submit and track your apology letters
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={newOpen} onOpenChange={setNewOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" /> Submit Apology
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                  <form onSubmit={submitApology}>
                    <DialogHeader>
                      <DialogTitle>Submit a New Apology</DialogTitle>
                      <DialogDescription>
                        Provide details for your apology letter.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                      <div className="space-y-2">
                        <Label htmlFor="attachment">
                          Attachment (Optional)
                        </Label>
                        <Input
                          id="attachment"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          onChange={handleFileChange}
                          aria-label="Upload apology document"
                        />
                        {selectedFile && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                              <Paperclip className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-800 flex-1">
                                {selectedFile.name} (
                                {(selectedFile.size / 1024).toFixed(1)} KB)
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFile(null);
                                  const input =
                                    document.getElementById("attachment");
                                  if (input) input.value = "";
                                }}
                                aria-label="Remove file"
                              >
                                ×
                              </Button>
                            </div>
                            {selectedFile.type.startsWith("image/") && (
                              <div className="relative w-full h-48 border rounded-md overflow-hidden bg-gray-50">
                                <img
                                  src={URL.createObjectURL(selectedFile)}
                                  alt="Preview"
                                  className="w-full h-full object-contain"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    const url =
                                      URL.createObjectURL(selectedFile);
                                    window.open(url, "_blank");
                                  }}
                                >
                                  Open in New Tab
                                </Button>
                              </div>
                            )}
                            {selectedFile.type === "application/pdf" && (
                              <div className="p-4 border rounded-md bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-12 w-12 text-red-600" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">
                                        PDF Document
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {selectedFile.name}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const url =
                                        URL.createObjectURL(selectedFile);
                                      window.open(url, "_blank");
                                    }}
                                  >
                                    Open PDF
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          JPG, PNG, or PDF - max 5MB
                        </p>
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
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        Submit
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading apologies...</p>
            </Card>
          ) : apologies.length === 0 ? (
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                No apologies found
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't submitted any apology letters yet
              </p>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                onClick={() => setNewOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Apology
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {apologies.map((ap) => (
                <Card
                  key={ap.id}
                  className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl overflow-hidden transition-shadow hover:shadow-2xl cursor-pointer"
                  onClick={() => router.push(`/student/apologies/${ap.id}`)}
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center capitalize">
                          {ap.type?.[0] ?? "A"}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground capitalize">
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
                    <p className="text-sm text-foreground mb-1 font-medium">
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
                </Card>
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
