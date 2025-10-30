"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/guard/RequireAuth";
import { api } from "@/lib/api";
import { clearAuth, getToken } from "@/lib/auth";
import { toast } from "sonner";
import { normalizeStatus, formatDate } from "@/lib/formatters";
import {
  ComplaintStatusBadge,
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
  ArrowLeft,
  Paperclip,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdvancedFilter } from "@/components/ui/advanced-filter";
import { exportToCSV, exportToJSON } from "@/lib/export";

const COMPLAINT_CATEGORIES = [
  { id: "all", name: "All Complaints", icon: LayoutDashboard },
  { id: "roommate", name: "Roommate Issues", icon: Users },
  { id: "cleanliness", name: "Cleanliness", icon: Trash2 },
  { id: "plumbing", name: "Plumbing", icon: Droplet },
  { id: "electricity", name: "Electricity", icon: Zap },
  { id: "Lost and Found", name: "Lost & Found", icon: Search },
  { id: "Other Issues", name: "Other Issues", icon: AlertCircle },
];

function AdminComplaintsInner() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterConfig, setFilterConfig] = useState(null);

  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );

  // Load complaints - with server-side filtering using query parameters
  useEffect(() => {
    if (!token) return;
    const loadComplaints = async () => {
      setLoading(true);
      setError("");
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
          setError(
            "Access denied. Please ensure you're logged in as an admin."
          );
        } else {
          setError("Failed to load complaints: " + errorMsg);
        }
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    loadComplaints();
  }, [token, statusFilter, selectedCategory]);

  // Client-side filtering for search query and date range (status and category handled server-side)
  const filteredComplaints = complaints
    .filter((c) => {
      // Apply advanced filter if configured (status, date range)
      if (filterConfig) {
        // Status filter from advanced filter
        if (
          filterConfig.status &&
          filterConfig.status !== "all" &&
          normalizeStatus(c.status) !== filterConfig.status
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

  const handleExport = (format = "csv") => {
    const fileName = `complaints_${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      const csvData = filteredComplaints.map((item) => ({
        ID: item.id,
        Title: item.title,
        Status: item.status,
        Category: item.type,
        Priority: item.priority || "N/A",
        Student: item.student?.user?.name || item.student?.name || "N/A",
        Room: item.student?.roomNo || item.student?.room_no || "N/A",
        Date: formatDate(item.createdAt || item.created_at || item.date),
      }));
      exportToCSV(csvData, fileName);
    } else if (format === "json") {
      exportToJSON(filteredComplaints, fileName);
    }
    toast.success(
      `Exported ${
        filteredComplaints.length
      } complaints as ${format.toUpperCase()}`
    );
  };

  const handleReviewComplaint = (complaintId) => {
    router.push(`/admin/complaints/${complaintId}`);
  };

  const CategoryIcon = ({ category }) => {
    const foundCategory = COMPLAINT_CATEGORIES.find(
      (cat) => cat.id === category
    );
    const Icon = foundCategory ? foundCategory.icon : AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <RequireAuth roles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 p-6 mb-6 shadow-xl shadow-indigo-500/10">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/dashboard")}
              className="pl-0 mb-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              All Complaints
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and review all student complaints
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {filteredComplaints.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-amber-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {
                        filteredComplaints.filter(
                          (c) => normalizeStatus(c.status) === "open"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-green-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Resolved
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {
                        filteredComplaints.filter(
                          (c) => normalizeStatus(c.status) === "resolved"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search complaints..."
                  className="pl-10 border-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] border-2">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <AdvancedFilter
                onFilterChange={setFilterConfig}
                currentFilters={filterConfig}
                filterOptions={{
                  status: [
                    { value: "open", label: "Open" },
                    { value: "inprogress", label: "In Progress" },
                    { value: "resolved", label: "Resolved" },
                  ],
                  dateRange: true,
                }}
                storageKey="admin-complaints-filter"
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
          </Card>

          {/* Complaints List */}
          {loading ? (
            <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading complaints...</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 text-red-700 dark:text-red-300 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 shadow-lg">
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                No complaints found
              </h3>
              <p className="text-muted-foreground">
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
                              {formatDate(
                                complaint.createdAt ||
                                  complaint.created_at ||
                                  complaint.date
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {complaint.type?.replace(/-/g, " ") || "Other"}
                        </Badge>
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
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {complaint.description}
                    </p>
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
                      {normalizeStatus(complaint.status) !== "resolved" && (
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
        </div>
      </div>
    </RequireAuth>
  );
}

export default function AdminComplaintsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <AdminComplaintsInner />
    </Suspense>
  );
}
