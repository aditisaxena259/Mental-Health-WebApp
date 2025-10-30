// app/admin/dashboard/page.jsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/guard/RequireAuth";
import { api } from "@/lib/api";
import { clearAuth, getToken, getRole } from "@/lib/auth";
import { toast } from "sonner";
import { normalizeStatus, formatDate } from "@/lib/formatters";
import {
  ComplaintStatusBadge,
  ApologyStatusBadge,
  PriorityBadge,
} from "@/components/shared/StatusBadges";
import {
  LayoutDashboard,
  Users,
  Droplet,
  Zap,
  Search,
  Trash2,
  AlertCircle,
  User,
  LogOut,
  CheckCircle,
  Menu,
  X,
  FileText,
  ArrowRight,
  FilterIcon,
  SlidersHorizontal,
  Clock,
  RefreshCw,
  ListFilter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NotificationBell } from "@/components/ui/notification-bell";
import { AdminAnalytics } from "@/components/dashboard/AdminAnalytics";
import { AdvancedFilter } from "@/components/ui/advanced-filter";
import { DashboardEnhancements } from "@/components/dashboard/DashboardEnhancements";
import { exportToCSV, exportToJSON } from "@/lib/export";
import { Download, BarChart3 } from "lucide-react";

const COMPLAINT_CATEGORIES = [
  { id: "all", name: "All Complaints", icon: LayoutDashboard },
  { id: "roommate", name: "Roommate Issues", icon: Users },
  { id: "cleanliness", name: "Cleanliness", icon: Trash2 },
  { id: "plumbing", name: "Plumbing", icon: Droplet },
  { id: "electricity", name: "Electricity", icon: Zap },
  { id: "lost-found", name: "Lost & Found", icon: Search },
  { id: "other", name: "Other Issues", icon: AlertCircle },
];

const APOLOGY_CATEGORIES = [
  { id: "all", name: "All Apologies", icon: LayoutDashboard },
  { id: "outing", name: "Outing", icon: Users },
  { id: "misconduct", name: "Misconduct", icon: AlertCircle },
  { id: "miscellaneous", name: "Miscellaneous", icon: FileText },
];

function AdminDashboardInner() {
  const router = useRouter();
  // Persist active tab in localStorage
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-active-tab") || "complaints";
    }
    return "complaints";
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filterConfig, setFilterConfig] = useState(null);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-active-tab", activeTab);
    }
  }, [activeTab]);

  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inReview: 0,
    resolutionRate: "0%",
    avgResolutionTime: "—",
    pendingApologies: 0,
  });
  const [complaints, setComplaints] = useState([]);
  const [apologies, setApologies] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loadingApologies, setLoadingApologies] = useState(false);
  const [listError, setListError] = useState("");

  // Student search state
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);

  // Fetch admin profile data
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin",
    roleTitle: "Warden",
    email: "",
    avatar: "/avatars/warden.svg",
  });

  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );

  const userRole = useMemo(
    () => (typeof window !== "undefined" ? getRole() : null),
    []
  );

  // Check if user has admin role
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      toast.error("Access Denied", {
        description: "You must be logged in as an admin to access this page.",
      });
      router.push("/login");
    }
  }, [userRole, router]);

  // TODO: API - Fetch admin profile from /api/profile
  useEffect(() => {
    if (!token) return;
    // api("/profile", { method: "GET" }, token)
    //   .then((data) => setAdminProfile(data))
    //   .catch(() => {});
  }, [token]);

  // Fetch metrics
  useEffect(() => {
    if (!token) return;
    Promise.all([
      api("/metrics/status-summary", { method: "GET" }, token).catch(() => ({
        total: 0,
        resolved: 0,
        open: 0,
        inprogress: 0,
      })),
      api("/metrics/resolution-rate", { method: "GET" }, token).catch(() => ({
        resolution_rate: 0,
      })),
      api("/metrics/pending-count", { method: "GET" }, token).catch(() => ({
        pending_count: 0,
      })),
      // Fetch pending apologies count using query parameter
      // Note: "pending" apologies are those with status "submitted" (awaiting review)
      api("/admin/apologies?status=submitted", { method: "GET" }, token).catch(
        () => ({
          data: [],
        })
      ),
    ])
      .then(([summary, rate, pending, pendingApologiesResp]) => {
        // Extract pending apologies count from the response
        const pendingApologiesData = Array.isArray(pendingApologiesResp?.data)
          ? pendingApologiesResp.data
          : Array.isArray(pendingApologiesResp)
          ? pendingApologiesResp
          : [];

        const next = {
          total: summary?.total ?? 0,
          resolved: summary?.resolved ?? 0,
          pending: pending?.pending_count ?? summary?.open ?? 0,
          inReview: summary?.inprogress ?? 0,
          resolutionRate:
            rate?.resolution_rate != null
              ? `${Math.round(rate.resolution_rate)}%`
              : "—%",
          avgResolutionTime: "—",
          pendingApologies: pendingApologiesData.length ?? 0,
        };
        setStats(next);
      })
      .catch(() => {});
  }, [token]);

  // Load complaints - with server-side filtering using query parameters
  useEffect(() => {
    if (!token) return;
    const loadComplaints = async () => {
      setLoadingComplaints(true);
      setListError("");
      try {
        // Build query parameters for server-side filtering
        const params = new URLSearchParams();
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (selectedCategory !== "all") {
          params.append("type", selectedCategory);
        }
        const queryString = params.toString() ? `?${params.toString()}` : "";

        const resp = await api(
          `/admin/complaints${queryString}`,
          { method: "GET" },
          token
        );
        const data = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp)
          ? resp
          : [];
        setComplaints(data);
      } catch (err) {
        console.error("Failed to load complaints:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.includes("403")) {
          setListError(
            "Access denied. Please ensure you're logged in as an admin."
          );
        } else {
          setListError("Failed to load complaints: " + errorMsg);
        }
        setComplaints([]);
      } finally {
        setLoadingComplaints(false);
      }
    };
    loadComplaints();
  }, [token, statusFilter, selectedCategory]);

  // Load apologies - with server-side filtering using query parameters
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoadingApologies(true);
      try {
        // Build query parameters for server-side filtering
        const params = new URLSearchParams();
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (selectedCategory !== "all") {
          params.append("type", selectedCategory);
        }
        const queryString = params.toString() ? `?${params.toString()}` : "";

        const resp = await api(
          `/admin/apologies${queryString}`,
          { method: "GET" },
          token
        );
        const data = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp)
          ? resp
          : [];
        setApologies(data);
      } catch (err) {
        console.error("Failed to load apologies:", err);
        setApologies([]);
      } finally {
        setLoadingApologies(false);
      }
    };
    load();
  }, [token, statusFilter, selectedCategory]);

  // Client-side filtering - only for search query and advanced filters
  // Status and category filtering now handled server-side via query params
  const filteredComplaints = complaints
    .filter((c) => {
      // Apply advanced filter if available (status, category, date range, priority)
      if (filterConfig) {
        // Status filter from advanced filter
        if (
          filterConfig.status &&
          filterConfig.status !== "all" &&
          normalizeStatus(c.status) !== filterConfig.status
        ) {
          return false;
        }
        // Category filter from advanced filter
        if (
          filterConfig.category &&
          filterConfig.category !== "all" &&
          c.type !== filterConfig.category
        ) {
          return false;
        }
        // Priority filter
        if (
          filterConfig.priority &&
          filterConfig.priority !== "all" &&
          c.priority !== filterConfig.priority
        ) {
          return false;
        }
        // Date range filter
        if (filterConfig.dateFrom) {
          const createdDate = new Date(c.createdAt || c.created_at || c.date);
          if (createdDate < new Date(filterConfig.dateFrom)) {
            return false;
          }
        }
        if (filterConfig.dateTo) {
          const createdDate = new Date(c.createdAt || c.created_at || c.date);
          if (createdDate > new Date(filterConfig.dateTo)) {
            return false;
          }
        }
      }
      return true;
    })
    .filter((c) => {
      const title = (c.title || "").toLowerCase();
      const name = (
        c.user?.name ||
        c.student?.user?.name ||
        c.student?.name ||
        ""
      ).toLowerCase();
      const room = (c.student?.roomNo || c.student?.room_no || "").toString();
      const q = searchQuery.toLowerCase();
      return (
        title.includes(q) || name.includes(q) || room.toLowerCase().includes(q)
      );
    });

  // Client-side filtering - only for search query (status and category now handled server-side)
  const filteredApologies = apologies
    .filter((ap) => {
      // Apply advanced filter if available (status, category, date range)
      if (filterConfig) {
        // Status filter from advanced filter
        if (
          filterConfig.status &&
          filterConfig.status !== "all" &&
          ap.status !== filterConfig.status
        ) {
          return false;
        }
        // Category filter from advanced filter
        if (
          filterConfig.category &&
          filterConfig.category !== "all" &&
          ap.type !== filterConfig.category
        ) {
          return false;
        }
        // Date range filter
        if (filterConfig.dateFrom) {
          const createdDate = new Date(
            ap.createdAt || ap.created_at || ap.date
          );
          if (createdDate < new Date(filterConfig.dateFrom)) {
            return false;
          }
        }
        if (filterConfig.dateTo) {
          const createdDate = new Date(
            ap.createdAt || ap.created_at || ap.date
          );
          if (createdDate > new Date(filterConfig.dateTo)) {
            return false;
          }
        }
      }
      return true;
    })
    .filter((ap) => {
      const q = searchQuery.toLowerCase();
      const title = (ap.title || ap.message || "").toLowerCase();
      const msg = (ap.message || ap.description || "").toLowerCase();
      const name = (
        ap.student?.user?.name ||
        ap.student?.name ||
        ""
      ).toLowerCase();
      return title.includes(q) || msg.includes(q) || name.includes(q);
    });

  const derivedStats = useMemo(() => {
    const data =
      activeTab === "complaints" ? filteredComplaints : filteredApologies;
    const total = data.length;
    const resolved = data.filter(
      (c) => normalizeStatus(c.status) === "resolved" || c.status === "accepted"
    ).length;
    const inReview = data.filter(
      (c) =>
        normalizeStatus(c.status) === "inprogress" || c.status === "reviewed"
    ).length;
    const pending = data.filter(
      (c) => normalizeStatus(c.status) === "open" || c.status === "submitted"
    ).length;
    const resolutionRate = total
      ? `${Math.round((resolved / total) * 100)}%`
      : "—%";
    return {
      total,
      resolved,
      pending,
      inReview,
      resolutionRate,
      avgResolutionTime: stats.avgResolutionTime,
    };
  }, [
    filteredComplaints,
    filteredApologies,
    activeTab,
    stats.avgResolutionTime,
  ]);

  const handleReviewComplaint = (complaintId) => {
    router.push(`/admin/complaints/${complaintId}`);
  };

  const handleReviewApology = (apologyId) => {
    router.push(`/admin/apologies/${apologyId}`);
  };

  const handleSearchStudent = async () => {
    if (!studentIdentifier.trim()) {
      toast.error("Please enter a student identifier");
      return;
    }

    setStudentSearchLoading(true);
    setStudentDetails(null);

    try {
      const data = await api(
        `/admin/student/${encodeURIComponent(studentIdentifier.trim())}`,
        { method: "GET" },
        token
      );
      setStudentDetails(data);
      toast.success("Student found");
    } catch (error) {
      toast.error(error?.message || "Student not found");
      setStudentDetails(null);
    } finally {
      setStudentSearchLoading(false);
    }
  };

  const handleExport = (format = "csv") => {
    const data =
      activeTab === "complaints" ? filteredComplaints : filteredApologies;
    const fileName = `${activeTab}_${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      const csvData = data.map((item) => ({
        ID: item.id,
        Title: item.title || item.message,
        Status: item.status,
        Category: item.type,
        Priority: item.priority || "N/A",
        Student: item.student?.user?.name || item.student?.name || "N/A",
        Room: item.student?.roomNo || item.student?.room_no || "N/A",
        Date: formatDate(item.createdAt || item.created_at || item.date),
      }));
      exportToCSV(csvData, fileName);
    } else if (format === "json") {
      exportToJSON(data, fileName);
    }
    toast.success(`Exported ${data.length} items as ${format.toUpperCase()}`);
  };

  const handleCommandAction = (action) => {
    switch (action) {
      case "export":
        handleExport("csv");
        break;
      case "analytics":
        setShowAnalytics(!showAnalytics);
        break;
      case "search":
        document.querySelector('input[type="text"]')?.focus();
        break;
      default:
        break;
    }
  };

  const CategoryIcon = ({ category }) => {
    const categories =
      activeTab === "complaints" ? COMPLAINT_CATEGORIES : APOLOGY_CATEGORIES;
    const foundCategory = categories.find((cat) => cat.id === category);
    const Icon = foundCategory ? foundCategory.icon : AlertCircle;
    return <Icon className="h-4 w-4" />;
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

  const currentCategories =
    activeTab === "complaints" ? COMPLAINT_CATEGORIES : APOLOGY_CATEGORIES;

  return (
    <RequireAuth roles={["admin"]}>
      <DashboardEnhancements role="admin" onAction={handleCommandAction} />
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex w-64 flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 shadow-xl">
          <div className="p-6 flex items-center justify-between">
            <Link href="/admin/dashboard">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    HostelCare
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Admin
                  </p>
                </div>
              </div>
            </Link>
            <NotificationBell role="admin" />
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 text-indigo-900 dark:text-indigo-100 font-medium shadow-sm border-2 border-indigo-200 dark:border-indigo-800"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/complaints"
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl text-foreground hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
            >
              <FileText className="h-5 w-5" />
              <span>All Complaints</span>
            </Link>
            <Link
              href="/admin/apologies"
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl text-foreground hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
            >
              <FileText className="h-5 w-5" />
              <span>All Apologies</span>
            </Link>
            <Link
              href="/admin/notifications"
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl text-foreground hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
            >
              <AlertCircle className="h-5 w-5" />
              <span>Notifications</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 w-full p-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
                  aria-label="Account menu"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-indigo-100 dark:ring-indigo-900">
                    <AvatarImage
                      src={adminProfile.avatar}
                      alt={adminProfile.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      {adminProfile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{adminProfile.name}</p>
                    <p className="text-xs text-gray-500">
                      {adminProfile.roleTitle}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Mobile menu button */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shadow-lg">
          <Link href="/admin/dashboard">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HostelCare
              </h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell role="admin" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside
              className="w-64 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-4 space-y-1 mt-14">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 text-indigo-900 dark:text-indigo-100 font-medium shadow-sm border-2 border-indigo-200 dark:border-indigo-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/complaints"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl text-foreground hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>All Complaints</span>
                </Link>
                <Link
                  href="/admin/apologies"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl text-foreground hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>All Apologies</span>
                </Link>
                <Link
                  href="/admin/notifications"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl text-foreground hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-xl text-foreground hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 w-full px-4 py-3 justify-start text-left text-sm rounded-xl text-foreground hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-950/50 dark:hover:to-rose-950/50 hover:text-red-600 transition-all"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 pt-16 md:pt-0">
          <div className="p-6">
            {/* Header with Tabs */}
            <div className="mb-6">
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v);
                  setSelectedCategory("all");
                }}
              >
                <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 p-6 mb-6 shadow-xl shadow-indigo-500/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Admin Dashboard
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Manage complaints and apology requests
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog
                        open={studentSearchOpen}
                        onOpenChange={setStudentSearchOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Search Student
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Search Student by ID</DialogTitle>
                            <DialogDescription>
                              Enter the student identifier (e.g., roll number,
                              student ID) to view their details.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="student-id">
                                Student Identifier
                              </Label>
                              <Input
                                id="student-id"
                                placeholder="e.g., 22BCE2210"
                                value={studentIdentifier}
                                onChange={(e) =>
                                  setStudentIdentifier(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSearchStudent();
                                }}
                              />
                            </div>
                            {studentDetails && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">
                                    Student Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="font-medium">Name:</div>
                                    <div>{studentDetails.name}</div>
                                    <div className="font-medium">Email:</div>
                                    <div>{studentDetails.email}</div>
                                    <div className="font-medium">
                                      Student ID:
                                    </div>
                                    <div>
                                      {studentDetails.studentIdentifier ||
                                        studentDetails.student_identifier}
                                    </div>
                                    <div className="font-medium">Hostel:</div>
                                    <div>{studentDetails.hostel}</div>
                                    <div className="font-medium">Room:</div>
                                    <div>
                                      {studentDetails.roomNo ||
                                        studentDetails.room_no}
                                    </div>
                                    {studentDetails.block && (
                                      <>
                                        <div className="font-medium">
                                          Block:
                                        </div>
                                        <div>{studentDetails.block}</div>
                                      </>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setStudentSearchOpen(false);
                                setStudentIdentifier("");
                                setStudentDetails(null);
                              }}
                            >
                              Close
                            </Button>
                            <Button
                              onClick={handleSearchStudent}
                              disabled={
                                studentSearchLoading ||
                                !studentIdentifier.trim()
                              }
                            >
                              {studentSearchLoading ? "Searching..." : "Search"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {showAnalytics ? "Hide" : "Show"} Analytics
                      </Button>
                      <TabsList className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                        <TabsTrigger value="complaints">Complaints</TabsTrigger>
                        <TabsTrigger value="apologies">Apologies</TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </div>

                {/* Analytics Section */}
                {showAnalytics && (
                  <div className="mb-6 rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 p-6">
                    <AdminAnalytics
                      complaints={
                        activeTab === "complaints" ? filteredComplaints : []
                      }
                      apologies={
                        activeTab === "apologies" ? filteredApologies : []
                      }
                    />
                  </div>
                )}

                {/* Stats cards - shared across both tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Total
                          </p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {derivedStats.total}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-2xl flex items-center justify-center shadow-lg">
                          <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-amber-500/10 hover:shadow-2xl hover:shadow-amber-500/20 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Pending
                          </p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            {derivedStats.pending}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-2xl flex items-center justify-center shadow-lg">
                          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Resolved
                          </p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {derivedStats.resolved}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters and Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label={`Search ${activeTab}`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <AdvancedFilter
                      onFilterChange={setFilterConfig}
                      currentFilters={filterConfig}
                      filterOptions={{
                        status:
                          activeTab === "complaints"
                            ? [
                                { value: "open", label: "Open" },
                                { value: "inprogress", label: "In Progress" },
                                { value: "resolved", label: "Resolved" },
                              ]
                            : [
                                { value: "submitted", label: "Submitted" },
                                { value: "reviewed", label: "Reviewed" },
                                { value: "accepted", label: "Accepted" },
                                { value: "rejected", label: "Rejected" },
                              ],
                        category: currentCategories
                          .filter((c) => c.id !== "all")
                          .map((c) => ({
                            value: c.id,
                            label: c.name,
                          })),
                        dateRange: true,
                      }}
                      storageKey={`admin-${activeTab}-filter`}
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport("csv")}>
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("json")}>
                          Export as JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Complaints Tab Content */}
                <TabsContent value="complaints" className="mt-0">
                  {loadingComplaints ? (
                    <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading complaints...
                      </p>
                    </div>
                  ) : listError ? (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 text-red-700 dark:text-red-300 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 shadow-lg">
                      <p className="text-sm">{listError}</p>
                    </div>
                  ) : filteredComplaints.length === 0 ? (
                    <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-1">
                        No complaints found
                      </h3>
                      <p className="text-gray-600">
                        {searchQuery
                          ? "Try adjusting your search or filters"
                          : "There are no complaints in this category yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredComplaints.map((complaint) => (
                        <Card
                          key={complaint.id}
                          className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all cursor-pointer"
                          onClick={() => handleReviewComplaint(complaint.id)}
                        >
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl shadow-md">
                                  <CategoryIcon category={complaint.type} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground text-lg">
                                    {complaint.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {complaint.user?.name ||
                                        complaint.student?.user?.name ||
                                        complaint.student?.name ||
                                        "Student"}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Room{" "}
                                      {complaint.student?.roomNo ||
                                        complaint.student?.room_no ||
                                        "—"}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {new Date(
                                        complaint.createdAt ||
                                          complaint.created_at ||
                                          complaint.date
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end md:self-auto">
                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
                                  {complaint.type?.replace(/-/g, " ") ||
                                    "Other"}
                                </Badge>
                                <PriorityBadge priority={complaint.priority} />
                                <ComplaintStatusBadge
                                  status={complaint.status}
                                />
                                {complaint.attachments?.length > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-2"
                                  >
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    {complaint.attachments.length}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReviewComplaint(complaint.id);
                                }}
                              >
                                View Details
                              </Button>
                              {normalizeStatus(complaint.status) !==
                                "resolved" && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReviewComplaint(complaint.id);
                                  }}
                                >
                                  Review & Respond
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Apologies Tab Content */}
                <TabsContent value="apologies" className="mt-0">
                  {loadingApologies ? (
                    <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading apologies...
                      </p>
                    </div>
                  ) : filteredApologies.length === 0 ? (
                    <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-1">
                        No apologies found
                      </h3>
                      <p className="text-gray-600">
                        {searchQuery
                          ? "Try adjusting your search or filters"
                          : "There are no apology requests yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredApologies.map((apology) => (
                        <Card
                          key={apology.id}
                          className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all cursor-pointer"
                          onClick={() => handleReviewApology(apology.id)}
                        >
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl shadow-md">
                                  <CategoryIcon category={apology.type} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground text-lg">
                                    {apology.title ||
                                      apology.message ||
                                      "Apology Request"}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {apology.student?.user?.name ||
                                        apology.student?.name ||
                                        "Student"}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {new Date(
                                        apology.createdAt || apology.created_at
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end md:self-auto">
                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
                                  {apology.type || "Miscellaneous"}
                                </Badge>
                                <ApologyStatusBadge status={apology.status} />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {apology.description || apology.message}
                            </p>
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReviewApology(apology.id);
                                }}
                              >
                                View Details
                              </Button>
                              {apology.status === "submitted" && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReviewApology(apology.id);
                                  }}
                                >
                                  Review
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <AdminDashboardInner />
    </Suspense>
  );
}
