// app/student/dashboard/page.js
"use client";

import React, { Suspense } from "react";
import RequireAuth from "@/components/guard/RequireAuth";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken, clearAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  Select as UiSelect,
  SelectContent as UiSelectContent,
  SelectItem as UiSelectItem,
  SelectTrigger as UiSelectTrigger,
  SelectValue as UiSelectValue,
} from "@/components/ui/select";
import {
  ComplaintStatusBadge,
  PriorityBadge,
} from "@/components/shared/StatusBadges";
import {
  Plus,
  Clock,
  Filter,
  Search,
  User,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Droplet,
  Zap,
  Trash2,
  Users,
  Menu,
  X,
  AlertTriangle,
  FileText,
  Paperclip,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationBell } from "@/components/ui/notification-bell";
import { StudentAnalytics } from "@/components/dashboard/StudentAnalytics";
import { DashboardEnhancements } from "@/components/dashboard/DashboardEnhancements";
import { useFormDraft } from "@/hooks/useFormDraft";
import { BarChart3 } from "lucide-react";
import { ApologyStatusBadge } from "@/components/shared/StatusBadges";

// Mock data for student complaints
const EMPTY_LIST = [];

// Complaint categories
// Values must match backend ComplaintType exactly
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

const APOLOGY_TYPES = [
  { id: "outing", name: "Outing" },
  { id: "misconduct", name: "Misconduct" },
  { id: "miscellaneous", name: "Miscellaneous" },
];

function StudentDashboardInner() {
  const router = useRouter();
  const [newComplaintOpen, setNewComplaintOpen] = useState(false);
  const [newApologyOpen, setNewApologyOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    type: "",
    description: "",
    priority: "",
  });
  const [newApology, setNewApology] = useState({
    type: "",
    message: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedApologyFile, setSelectedApologyFile] = useState(null);
  const [complaintErrors, setComplaintErrors] = useState({});
  const [apologyErrors, setApologyErrors] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [complaints, setComplaints] = useState(EMPTY_LIST);
  const [apologies, setApologies] = useState(EMPTY_LIST);
  const [loading, setLoading] = useState(false);
  const [loadingApologies, setLoadingApologies] = useState(false);
  const [error, setError] = useState("");
  const [apologyError, setApologyError] = useState("");
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

  // Auto-save form draft
  const {
    formData: draftData,
    updateFormData: updateDraft,
    clearDraft,
    lastSaved,
  } = useFormDraft("student-complaint-draft", newComplaint, {
    autoSaveInterval: 3000,
  });

  // TODO: API - Fetch student profile from backend
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    // api("/profile", { method: "GET" }, token)
    //   .then((data) => {
    //     setStudentInfo({
    //       name: data.name || "Student",
    //       id: data.id || data.student_id || "",
    //       room: data.room || data.room_no || "",
    //       block: data.block || "",
    //       floor: data.floor || "",
    //       course: data.course || "",
    //       year: data.year || "",
    //       avatar: data.avatar || "/avatars/student.svg",
    //     });
    //   })
    //   .catch(() => {});
  }, []);

  const logout = async () => {
    try {
      const token = getToken();
      await api("/logout", { method: "POST" }, token || undefined);
      clearAuth();
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Logout failed. Please try again later.");
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    api("/student/complaints", { method: "GET" }, token)
      .then((data) => {
        // Expecting { count, data }
        setComplaints(Array.isArray(data?.data) ? data.data : []);
      })
      .catch((e) => setError(e?.message || "Failed to fetch complaints"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    setLoadingApologies(true);
    api("/student/apologies", { method: "GET" }, token)
      .then((data) => {
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setApologies(list);
      })
      .catch((e) => setApologyError(e?.message || "Failed to fetch apologies"))
      .finally(() => setLoadingApologies(false));
  }, []);

  const handleViewComplaint = (complaintId) => {
    if (!complaintId || complaintId === "undefined" || complaintId === "null") {
      toast.error("Invalid complaint ID");
      return;
    }
    router.push(`/student/complaints/${complaintId}`);
  };

  const handleViewApology = (apologyId) => {
    if (!apologyId || apologyId === "undefined" || apologyId === "null") {
      toast.error("Invalid apology ID");
      return;
    }
    router.push(`/student/apologies/${apologyId}`);
  };

  const handleNewComplaintSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to submit a complaint.");
      return;
    }

    // Validate required fields
    const errors = {};
    if (!newComplaint.title?.trim()) {
      errors.title = "Title is required";
    }
    if (!newComplaint.type) {
      errors.type = "Category is required";
    }
    if (!newComplaint.description?.trim()) {
      errors.description = "Description is required";
    }
    if (!newComplaint.priority) {
      errors.priority = "Priority is required";
    }

    if (Object.keys(errors).length > 0) {
      setComplaintErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setComplaintErrors({});

    try {
      // Build multipart/form-data per API
      const form = new FormData();
      form.append("title", newComplaint.title.trim());
      form.append("type", newComplaint.type);
      form.append("description", newComplaint.description.trim());
      if (newComplaint.priority) form.append("priority", newComplaint.priority);
      if (selectedFile) {
        form.append("attachments", selectedFile);
      }

      const createdComplaint = await api(
        "/student/complaints",
        {
          method: "POST",
          body: form,
        },
        token
      );

      toast.success("Complaint submitted successfully");
      setNewComplaintOpen(false);
      setNewComplaint({ title: "", type: "", description: "", priority: "" });
      setSelectedFile(null);
      clearDraft(); // Clear the auto-saved draft

      // Refresh list
      const data = await api("/student/complaints", { method: "GET" }, token);
      setComplaints(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Complaint submission error:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to submit complaint";
      toast.error(msg);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg"]; // JPEG only per API
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG (.jpg, .jpeg) files are allowed");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleApologyFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedApologyFile(null);
      setApologyErrors({ ...apologyErrors, attachment: undefined });
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

    setSelectedApologyFile(file);
    setApologyErrors({ ...apologyErrors, attachment: undefined });
  };

  const handleNewApologySubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to submit an apology.");
      return;
    }

    // Validate required fields
    const errors = {};
    if (!newApology.type) {
      errors.type = "Type is required";
    }
    if (!newApology.message?.trim()) {
      errors.message = "Message is required";
    }

    if (Object.keys(errors).length > 0) {
      setApologyErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setApologyErrors({});

    try {
      await api(
        "/student/apologies",
        {
          method: "POST",
          body: JSON.stringify({
            type: newApology.type,
            message: newApology.message,
            description: newApology.description || undefined,
          }),
        },
        token
      );

      if (selectedApologyFile) {
        console.log(
          "TODO: Upload apology file to backend:",
          selectedApologyFile.name
        );
        // TODO: Implement file upload endpoint when available
      }

      toast.success("Apology letter submitted successfully");
      setNewApologyOpen(false);
      setNewApology({ type: "", message: "", description: "" });
      setSelectedApologyFile(null);

      // Refresh list
      const data = await api("/student/apologies", { method: "GET" }, token);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setApologies(list);
    } catch (err) {
      console.error("Apology submission error:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to submit apology";
      toast.error(msg);
    }
  };

  const handleCommandAction = (action) => {
    switch (action) {
      case "new-complaint":
        setNewComplaintOpen(true);
        break;
      case "analytics":
        setShowAnalytics(!showAnalytics);
        break;
      default:
        break;
    }
  };

  const getCategoryIcon = (categoryIdOrType) => {
    const category = COMPLAINT_CATEGORIES.find(
      (cat) => cat.id === categoryIdOrType || cat.apiValue === categoryIdOrType
    );
    const Icon = category ? category.icon : AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <RequireAuth roles={["student"]}>
      <DashboardEnhancements role="student" onAction={handleCommandAction} />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur z-50 border-b px-4 py-3 flex items-center justify-between">
          <Link href="/student/dashboard">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HostelCare
              </h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell role="student" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-card overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 mt-14">
                <div className="flex items-center gap-3 mb-6 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={studentInfo.avatar}
                      alt={studentInfo.name}
                    />
                    <AvatarFallback>
                      {studentInfo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <UiSelect
                        value={newComplaint.priority}
                        onValueChange={(value) => {
                          const updated = { ...newComplaint, priority: value };
                          setNewComplaint(updated);
                          updateDraft(updated);
                          if (complaintErrors.priority) {
                            setComplaintErrors({
                              ...complaintErrors,
                              priority: undefined,
                            });
                          }
                        }}
                      >
                        <UiSelectTrigger
                          id="priority"
                          className={
                            complaintErrors.priority ? "border-red-500" : ""
                          }
                        >
                          <UiSelectValue placeholder="Select priority" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                          <UiSelectItem value="low">Low</UiSelectItem>
                          <UiSelectItem value="medium">Medium</UiSelectItem>
                          <UiSelectItem value="high">High</UiSelectItem>
                        </UiSelectContent>
                      </UiSelect>
                      {complaintErrors.priority && (
                        <p className="text-sm text-red-500">
                          {complaintErrors.priority}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">{studentInfo.name}</p>
                    <p className="text-sm text-gray-600">{studentInfo.id}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  <Link
                    href="/student/dashboard"
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md bg-indigo-50 text-indigo-900 font-medium"
                  >
                    <Clock className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/student/complaints"
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md text-foreground hover:bg-accent"
                  >
                    <FileText className="h-5 w-5" />
                    <span>My Complaints</span>
                  </Link>
                  <Link
                    href="/student/apologies"
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md text-foreground hover:bg-accent"
                  >
                    <FileText className="h-5 w-5" />
                    <span>My Apologies</span>
                  </Link>
                  <Link
                    href="/student/notifications"
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md text-foreground hover:bg-accent"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    href="/student/profile"
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md text-foreground hover:bg-accent"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 w-full px-4 py-3 justify-start text-left text-sm rounded-md text-foreground hover:bg-accent"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-7xl mx-auto px-6 pt-16 md:pt-6 pb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar - desktop */}
            <aside className="hidden md:block w-64 space-y-6">
              <div className="mb-6 flex items-center justify-between">
                <Link href="/student/dashboard">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">H</span>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      HostelCare
                    </h1>
                  </div>
                </Link>
                <NotificationBell role="student" />
              </div>

              <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={studentInfo.avatar}
                        alt={studentInfo.name}
                      />
                      <AvatarFallback>
                        {studentInfo.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{studentInfo.name}</p>
                      <p className="text-sm text-gray-600">{studentInfo.id}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{studentInfo.room}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Block:</span>
                      <span className="font-medium">{studentInfo.block}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium">{studentInfo.floor}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Link href="/student/profile">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                  <CardDescription>Contact your hostel warden</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/warden.svg" alt="Warden" />
                      <AvatarFallback>W</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Hostel Warden</p>
                      <p className="text-xs text-gray-600">Contact Support</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() =>
                      (window.location.href = "mailto:warden@hostel.edu")
                    }
                  >
                    Contact Warden
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Main content */}
            <main className="flex-1 space-y-6">
              {/* Header / Welcome */}
              <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                      Welcome back, {studentInfo.name.split(" ")[0]}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Track submissions, create new issues, and see updates at a
                      glance.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-2 shrink-0"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {showAnalytics ? "Hide" : "Show"} Analytics
                  </Button>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      My Complaints
                    </CardTitle>
                    <CardDescription>
                      {complaints.length} total complaint
                      {complaints.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Dialog
                      open={newComplaintOpen}
                      onOpenChange={setNewComplaintOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                          <Plus className="h-4 w-4 mr-2" />
                          New Complaint
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleNewComplaintSubmit}>
                          <DialogHeader>
                            <DialogTitle>Submit a New Complaint</DialogTitle>
                            <DialogDescription>
                              Please provide details about the issue you're
                              experiencing.
                              {lastSaved && (
                                <span className="block text-xs text-green-600 mt-1">
                                  Draft saved{" "}
                                  {new Date(lastSaved).toLocaleTimeString()}
                                </span>
                              )}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Complaint Title *</Label>
                              <Input
                                id="title"
                                placeholder="Brief title for your complaint"
                                value={newComplaint.title}
                                onChange={(e) => {
                                  const updated = {
                                    ...newComplaint,
                                    title: e.target.value,
                                  };
                                  setNewComplaint(updated);
                                  updateDraft(updated);
                                  if (complaintErrors.title) {
                                    setComplaintErrors({
                                      ...complaintErrors,
                                      title: undefined,
                                    });
                                  }
                                }}
                                className={
                                  complaintErrors.title ? "border-red-500" : ""
                                }
                              />
                              {complaintErrors.title && (
                                <p className="text-sm text-red-500">
                                  {complaintErrors.title}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Category *</Label>
                              <UiSelect
                                value={newComplaint.type}
                                onValueChange={(value) => {
                                  const updated = {
                                    ...newComplaint,
                                    type: value,
                                  };
                                  setNewComplaint(updated);
                                  updateDraft(updated);
                                  if (complaintErrors.type) {
                                    setComplaintErrors({
                                      ...complaintErrors,
                                      type: undefined,
                                    });
                                  }
                                }}
                              >
                                <UiSelectTrigger
                                  id="category"
                                  className={
                                    complaintErrors.type ? "border-red-500" : ""
                                  }
                                >
                                  <UiSelectValue placeholder="Select category" />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                  {COMPLAINT_CATEGORIES.map((category) => (
                                    <UiSelectItem
                                      key={category.id}
                                      value={category.apiValue}
                                    >
                                      <div className="flex items-center gap-2">
                                        {React.createElement(category.icon, {
                                          className: "h-4 w-4",
                                        })}
                                        <span>{category.name}</span>
                                      </div>
                                    </UiSelectItem>
                                  ))}
                                </UiSelectContent>
                              </UiSelect>
                              {complaintErrors.type && (
                                <p className="text-sm text-red-500">
                                  {complaintErrors.type}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description *</Label>
                              <Textarea
                                id="description"
                                placeholder="Please provide detailed information about your complaint"
                                rows={5}
                                value={newComplaint.description}
                                onChange={(e) => {
                                  const updated = {
                                    ...newComplaint,
                                    description: e.target.value,
                                  };
                                  setNewComplaint(updated);
                                  updateDraft(updated);
                                  if (complaintErrors.description) {
                                    setComplaintErrors({
                                      ...complaintErrors,
                                      description: undefined,
                                    });
                                  }
                                }}
                                className={
                                  complaintErrors.description
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {complaintErrors.description && (
                                <p className="text-sm text-red-500">
                                  {complaintErrors.description}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="priority">Priority *</Label>
                              <UiSelect
                                value={newComplaint.priority}
                                onValueChange={(value) => {
                                  const updated = {
                                    ...newComplaint,
                                    priority: value,
                                  };
                                  setNewComplaint(updated);
                                  updateDraft(updated);
                                  if (complaintErrors.priority) {
                                    setComplaintErrors({
                                      ...complaintErrors,
                                      priority: undefined,
                                    });
                                  }
                                }}
                              >
                                <UiSelectTrigger
                                  id="priority"
                                  className={
                                    complaintErrors.priority
                                      ? "border-red-500"
                                      : ""
                                  }
                                >
                                  <UiSelectValue placeholder="Select priority" />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                  <UiSelectItem value="low">Low</UiSelectItem>
                                  <UiSelectItem value="medium">
                                    Medium
                                  </UiSelectItem>
                                  <UiSelectItem value="high">High</UiSelectItem>
                                </UiSelectContent>
                              </UiSelect>
                              {complaintErrors.priority && (
                                <p className="text-sm text-red-500">
                                  {complaintErrors.priority}
                                </p>
                              )}
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
                                aria-label="Upload attachment"
                              />
                              {selectedFile && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                    <Paperclip className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-800 flex-1">
                                      {selectedFile.name} (
                                      {(selectedFile.size / 1024).toFixed(1)}{" "}
                                      KB)
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedFile(null);
                                        const input =
                                          document.getElementById(
                                            "attachments"
                                          );
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
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                JPEG only, max 5MB
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setNewComplaintOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Submit Complaint</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Link href="/student/complaints">
                      <Button variant="outline" className="w-full">
                        View All Complaints
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      My Apologies
                    </CardTitle>
                    <CardDescription>
                      {apologies.length} total apology
                      {apologies.length !== 1 ? "ies" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Dialog
                      open={newApologyOpen}
                      onOpenChange={setNewApologyOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                          <Plus className="h-4 w-4 mr-2" /> New Apology
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleNewApologySubmit}>
                          <DialogHeader>
                            <DialogTitle>Submit a New Apology</DialogTitle>
                            <DialogDescription>
                              Provide details for your apology letter.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="apology-type">Type *</Label>
                              <UiSelect
                                value={newApology.type}
                                onValueChange={(val) => {
                                  setNewApology({ ...newApology, type: val });
                                  if (apologyErrors.type) {
                                    setApologyErrors({
                                      ...apologyErrors,
                                      type: undefined,
                                    });
                                  }
                                }}
                              >
                                <UiSelectTrigger
                                  id="apology-type"
                                  className={
                                    apologyErrors.type ? "border-red-500" : ""
                                  }
                                >
                                  <UiSelectValue placeholder="Select type" />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                  {APOLOGY_TYPES.map((t) => (
                                    <UiSelectItem key={t.id} value={t.id}>
                                      {t.name}
                                    </UiSelectItem>
                                  ))}
                                </UiSelectContent>
                              </UiSelect>
                              {apologyErrors.type && (
                                <p className="text-sm text-red-500">
                                  {apologyErrors.type}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="apology-message">Message *</Label>
                              <Input
                                id="apology-message"
                                placeholder="Brief message"
                                value={newApology.message}
                                onChange={(e) => {
                                  setNewApology({
                                    ...newApology,
                                    message: e.target.value,
                                  });
                                  if (apologyErrors.message) {
                                    setApologyErrors({
                                      ...apologyErrors,
                                      message: undefined,
                                    });
                                  }
                                }}
                                className={
                                  apologyErrors.message ? "border-red-500" : ""
                                }
                              />
                              {apologyErrors.message && (
                                <p className="text-sm text-red-500">
                                  {apologyErrors.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="apology-description">
                                Description
                              </Label>
                              <Textarea
                                id="apology-description"
                                placeholder="Detailed explanation (optional)"
                                rows={4}
                                value={newApology.description}
                                onChange={(e) =>
                                  setNewApology({
                                    ...newApology,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="apology-attachment">
                                Attachment (Optional)
                              </Label>
                              <Input
                                id="apology-attachment"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={handleApologyFileChange}
                                aria-label="Upload apology document"
                                className={
                                  apologyErrors.attachment
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {selectedApologyFile && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                    <Paperclip className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-800 flex-1">
                                      {selectedApologyFile.name} (
                                      {(
                                        selectedApologyFile.size / 1024
                                      ).toFixed(1)}{" "}
                                      KB)
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedApologyFile(null);
                                        const input =
                                          document.getElementById(
                                            "apology-attachment"
                                          );
                                        if (input) input.value = "";
                                      }}
                                      aria-label="Remove file"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                  {selectedApologyFile.type.startsWith(
                                    "image/"
                                  ) && (
                                    <div className="relative w-full h-48 border rounded-md overflow-hidden bg-gray-50">
                                      <img
                                        src={URL.createObjectURL(
                                          selectedApologyFile
                                        )}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                        onLoad={(e) => {
                                          URL.revokeObjectURL(e.target.src);
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                          const url =
                                            URL.createObjectURL(
                                              selectedApologyFile
                                            );
                                          window.open(url, "_blank");
                                        }}
                                      >
                                        Open in New Tab
                                      </Button>
                                    </div>
                                  )}
                                  {selectedApologyFile.type ===
                                    "application/pdf" && (
                                    <div className="p-4 border rounded-md bg-gray-50">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-12 w-12 text-red-600" />
                                          <div>
                                            <p className="text-sm font-medium text-gray-700">
                                              PDF Document
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {selectedApologyFile.name}
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() => {
                                            const url =
                                              URL.createObjectURL(
                                                selectedApologyFile
                                              );
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
                              {apologyErrors.attachment && (
                                <p className="text-sm text-red-500">
                                  {apologyErrors.attachment}
                                </p>
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
                              onClick={() => setNewApologyOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                            >
                              Submit Apology
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Link href="/student/apologies">
                      <Button variant="outline" className="w-full">
                        View All Apologies
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Section */}
              <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates on your submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="complaints">
                    <TabsList>
                      <TabsTrigger value="complaints">Complaints</TabsTrigger>
                      <TabsTrigger value="apologies">Apologies</TabsTrigger>
                    </TabsList>
                    <TabsContent value="complaints">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                      ) : complaints.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground text-sm">
                            No complaints yet
                          </p>
                          <div className="mt-4">
                            <Button onClick={() => setNewComplaintOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" /> Create your
                              first complaint
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {complaints.slice(0, 3).map((complaint) => (
                            <div
                              key={complaint.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => handleViewComplaint(complaint.id)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                                  {getCategoryIcon(complaint.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {complaint.title}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-2">
                                    {formatDate(complaint.created_at)}
                                    <span>•</span>
                                    <span className="inline-flex items-center">
                                      <PriorityBadge
                                        priority={complaint.priority}
                                      />
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div>
                                <ComplaintStatusBadge
                                  status={complaint.status}
                                />
                              </div>
                            </div>
                          ))}
                          {complaints.length > 3 && (
                            <Link href="/student/complaints">
                              <Button variant="ghost" className="w-full">
                                View All {complaints.length} Complaints
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="apologies">
                      {loadingApologies ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                      ) : apologies.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground text-sm">
                            No apologies yet
                          </p>
                          <div className="mt-4">
                            <Link href="/student/apologies">
                              <Button>
                                <Plus className="h-4 w-4 mr-2" /> Submit a new
                                apology
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {apologies.slice(0, 3).map((apology) => (
                            <div
                              key={apology.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => handleViewApology(apology.id)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {apology.title || apology.message}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(
                                      apology.created_at || apology.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <ApologyStatusBadge status={apology.status} />
                              </div>
                            </div>
                          ))}
                          {apologies.length > 3 && (
                            <Link href="/student/apologies">
                              <Button variant="ghost" className="w-full">
                                View All {apologies.length} Apologies
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Analytics Section */}
              {showAnalytics && (
                <div className="mb-8 space-y-6">
                  <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-4">
                    <StudentAnalytics
                      complaints={complaints}
                      apologies={apologies}
                    />
                  </div>
                  {/* Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Complaints Overview
                        </CardTitle>
                        <CardDescription>Current statuses</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-3 gap-3">
                        <StatCard
                          title="Pending"
                          color="amber"
                          value={
                            complaints.filter((c) => c.status === "open").length
                          }
                          icon={Clock}
                        />
                        <StatCard
                          title="In Review"
                          color="blue"
                          value={
                            complaints.filter((c) => c.status === "inprogress")
                              .length
                          }
                          icon={AlertCircle}
                        />
                        <StatCard
                          title="Resolved"
                          color="green"
                          value={
                            complaints.filter((c) => c.status === "resolved")
                              .length
                          }
                          icon={CheckCircle}
                        />
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Apologies Overview
                        </CardTitle>
                        <CardDescription>Submission statuses</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard
                          title="Submitted"
                          color="amber"
                          value={
                            apologies.filter((a) => a.status === "submitted")
                              .length
                          }
                          icon={Clock}
                        />
                        <StatCard
                          title="Reviewed"
                          color="blue"
                          value={
                            apologies.filter((a) => a.status === "reviewed")
                              .length
                          }
                          icon={AlertCircle}
                        />
                        <StatCard
                          title="Accepted"
                          color="green"
                          value={
                            apologies.filter((a) => a.status === "accepted")
                              .length
                          }
                          icon={CheckCircle}
                        />
                        <StatCard
                          title="Rejected"
                          color="amber"
                          value={
                            apologies.filter((a) => a.status === "rejected")
                              .length
                          }
                          icon={XCircle}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

// Small presentational card with consistent colors
function StatCard({ title, value, icon: Icon, color = "indigo" }) {
  const palette = {
    amber: {
      bg: "bg-amber-50 border-amber-200",
      dot: "bg-amber-100",
      icon: "text-amber-600",
      title: "text-amber-800",
      value: "text-amber-900",
    },
    blue: {
      bg: "bg-blue-50 border-blue-200",
      dot: "bg-blue-100",
      icon: "text-blue-600",
      title: "text-blue-800",
      value: "text-blue-900",
    },
    green: {
      bg: "bg-green-50 border-green-200",
      dot: "bg-green-100",
      icon: "text-green-600",
      title: "text-green-800",
      value: "text-green-900",
    },
    indigo: {
      bg: "bg-indigo-50 border-indigo-200",
      dot: "bg-indigo-100",
      icon: "text-indigo-600",
      title: "text-indigo-800",
      value: "text-indigo-900",
    },
  };
  const c = palette[color] || palette.indigo;
  return (
    <Card className={`${c.bg}`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${c.title}`}>{title}</p>
          <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
        </div>
        <div
          className={`h-10 w-10 ${c.dot} rounded-full flex items-center justify-center`}
        >
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={null}>
      <StudentDashboardInner />
    </Suspense>
  );
}
