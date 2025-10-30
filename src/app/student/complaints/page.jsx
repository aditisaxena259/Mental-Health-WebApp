"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/guard/RequireAuth";
import { api } from "@/lib/api";
import { getToken, clearAuth } from "@/lib/auth";
import { toast } from "sonner";
import { formatDate } from "@/lib/formatters";
import {
  ComplaintStatusBadge,
  PriorityBadge,
} from "@/components/shared/StatusBadges";
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
  Search,
  ArrowLeft,
  AlertTriangle,
  Paperclip,
  Users,
  Trash2,
  Droplet,
  Zap,
  AlertCircle,
} from "lucide-react";

const COMPLAINT_CATEGORIES = [
  {
    id: "roommate",
    name: "Roommate Issues",
    apiValue: "roommate",
    icon: Users,
  },
  {
    id: "cleanliness",
    name: "Cleanliness",
    apiValue: "cleanliness",
    icon: Trash2,
  },
  { id: "plumbing", name: "Plumbing", apiValue: "plumbing", icon: Droplet },
  {
    id: "electricity",
    name: "Electricity",
    apiValue: "electricity",
    icon: Zap,
  },
  {
    id: "lost-found",
    name: "Lost & Found",
    apiValue: "Lost and Found",
    icon: Search,
  },
  {
    id: "other",
    name: "Other Issues",
    apiValue: "Other Issues",
    icon: AlertCircle,
  },
];

function StudentComplaintsInner() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    priority: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );

  const fetchComplaints = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api("/student/complaints", { method: "GET" }, token);
      setComplaints(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      toast.error(e?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = (complaint.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (!form.priority) {
        toast.error("Please select a priority");
        return;
      }
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("type", form.type);
      fd.append("description", form.description.trim());
      if (form.priority) fd.append("priority", form.priority);
      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          fd.append("attachments[]", file);
        });
      }

      await api("/student/complaints", { method: "POST", body: fd }, token);

      toast.success("Complaint submitted successfully");
      setNewOpen(false);
      setForm({ title: "", type: "", description: "" });
      setSelectedFiles([]);
      fetchComplaints();
    } catch (e) {
      toast.error(e?.message || "Failed to submit complaint");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    // Validate each file
    const validFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg"];

    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds 5MB size limit`);
        continue;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} must be JPEG format`);
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles(validFiles);
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) selected`);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getCategoryIcon = (categoryType) => {
    const category = COMPLAINT_CATEGORIES.find(
      (cat) => cat.id === categoryType || cat.apiValue === categoryType
    );
    const Icon = category ? category.icon : AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <RequireAuth roles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push("/student/dashboard")}
                className="pl-0 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                My Complaints
              </h1>
              <p className="text-muted-foreground">
                Track and manage your hostel complaints
              </p>
            </div>
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" /> Submit New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Submit a New Complaint</DialogTitle>
                    <DialogDescription>
                      Please provide details about the issue you're
                      experiencing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Complaint Title *</Label>
                      <Input
                        id="title"
                        placeholder="Brief title for your complaint"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={form.type}
                        onValueChange={(value) =>
                          setForm({ ...form, type: value })
                        }
                        required
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPLAINT_CATEGORIES.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.apiValue}
                            >
                              <div className="flex items-center gap-2">
                                {React.createElement(category.icon, {
                                  className: "h-4 w-4",
                                })}
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select
                        value={form.priority}
                        onValueChange={(value) =>
                          setForm({ ...form, priority: value })
                        }
                        required
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide detailed information"
                        rows={5}
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attachments">
                        Attachments (Optional)
                      </Label>
                      <Input
                        id="attachments"
                        type="file"
                        accept="image/jpeg"
                        onChange={handleFileChange}
                        multiple
                      />
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                <Paperclip className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-800 flex-1">
                                  {file.name} ({(file.size / 1024).toFixed(1)}{" "}
                                  KB)
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  ×
                                </Button>
                              </div>
                              {file.type.startsWith("image/") && (
                                <div className="relative w-full h-48 border rounded-md overflow-hidden bg-gray-50">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        JPEG only, max 5MB per file, multiple files allowed
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
                      Submit Complaint
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search complaints..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Complaints List */}
          {loading ? (
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading complaints...</p>
            </Card>
          ) : filteredComplaints.length === 0 ? (
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                No complaints found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "You haven't submitted any complaints yet"}
              </p>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                onClick={() => setNewOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit a Complaint
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
                  onClick={() =>
                    router.push(`/student/complaints/${complaint.id}`)
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                          {getCategoryIcon(
                            complaint.type || complaint.category
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {complaint.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>#{complaint.id?.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{formatDate(complaint.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={complaint.priority} />
                        <ComplaintStatusBadge status={complaint.status} />
                        {complaint.attachments?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Paperclip className="h-3 w-3 mr-1" />
                            {complaint.attachments.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {complaint.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Last updated:{" "}
                        {formatDate(
                          complaint.updated_at || complaint.created_at
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

export default function StudentComplaintsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentComplaintsInner />
    </Suspense>
  );
}
