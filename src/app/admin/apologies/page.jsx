"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/guard/RequireAuth";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { formatDate } from "@/lib/formatters";
import { ApologyStatusBadge } from "@/components/shared/StatusBadges";
import {
  LayoutDashboard,
  Users,
  AlertCircle,
  FileText,
  ArrowLeft,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search } from "lucide-react";
import { AdvancedFilter } from "@/components/ui/advanced-filter";
import { exportToCSV, exportToJSON } from "@/lib/export";

const APOLOGY_CATEGORIES = [
  { id: "all", name: "All Apologies", icon: LayoutDashboard },
  { id: "outing", name: "Outing", icon: Users },
  { id: "misconduct", name: "Misconduct", icon: AlertCircle },
  { id: "miscellaneous", name: "Miscellaneous", icon: FileText },
];

function AdminApologiesInner() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [apologies, setApologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterConfig, setFilterConfig] = useState(null);

  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );

  // Load apologies - with server-side filtering using query parameters
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
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
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.includes("403")) {
          toast.error(
            "Access denied. Please ensure you're logged in as an admin."
          );
        } else {
          toast.error("Failed to load apologies: " + errorMsg);
        }
        setApologies([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, statusFilter, selectedCategory]);

  // Client-side filtering for search query and date range (status and category handled server-side)
  const filteredApologies = apologies
    .filter((ap) => {
      // Apply advanced filter if configured (status, date range)
      if (filterConfig) {
        // Status filter from advanced filter
        if (
          filterConfig.status &&
          filterConfig.status !== "all" &&
          ap.status !== filterConfig.status
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

  const handleExport = (format = "csv") => {
    const fileName = `apologies_${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      const csvData = filteredApologies.map((item) => ({
        ID: item.id,
        Message: item.message,
        Status: item.status,
        Type: item.type,
        Student: item.student?.user?.name || item.student?.name || "N/A",
        Room: item.student?.roomNo || item.student?.room_no || "N/A",
        Date: formatDate(item.createdAt || item.created_at || item.date),
      }));
      exportToCSV(csvData, fileName);
    } else if (format === "json") {
      exportToJSON(filteredApologies, fileName);
    }
    toast.success(
      `Exported ${
        filteredApologies.length
      } apologies as ${format.toUpperCase()}`
    );
  };

  const handleReviewApology = (apologyId) => {
    router.push(`/admin/apologies/${apologyId}`);
  };

  const CategoryIcon = ({ category }) => {
    const foundCategory = APOLOGY_CATEGORIES.find((cat) => cat.id === category);
    const Icon = foundCategory ? foundCategory.icon : AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <RequireAuth roles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 mb-6">
            <CardContent className="p-6">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/dashboard")}
                className="pl-0 mb-3 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900 dark:hover:to-purple-900 transition-all rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                All Apologies
              </h1>
              <p className="text-muted-foreground">
                Review and manage all student apology letters
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Total
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {filteredApologies.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-amber-500/10 hover:shadow-2xl hover:shadow-amber-500/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Submitted
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {
                        filteredApologies.filter(
                          (a) => a.status === "submitted"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Reviewed
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {
                        filteredApologies.filter((a) => a.status === "reviewed")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Accepted
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {
                        filteredApologies.filter((a) => a.status === "accepted")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search apologies..."
                    className="pl-10 border-2 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full md:w-[200px] border-2 rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {APOLOGY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] border-2 rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <AdvancedFilter
                  onFilterChange={setFilterConfig}
                  currentFilters={filterConfig}
                  filterOptions={{
                    status: [
                      { value: "submitted", label: "Submitted" },
                      { value: "reviewed", label: "Reviewed" },
                      { value: "accepted", label: "Accepted" },
                      { value: "rejected", label: "Rejected" },
                    ],
                    dateRange: true,
                  }}
                  storageKey="admin-apologies-filter"
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
            </CardContent>
          </Card>

          {/* Apologies List */}
          {loading ? (
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading apologies...
                </p>
              </CardContent>
            </Card>
          ) : filteredApologies.length === 0 ? (
            <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
              <CardContent className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No apologies found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "There are no apology requests yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApologies.map((apology) => (
                <Card
                  key={apology.id}
                  className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all cursor-pointer"
                  onClick={() => handleReviewApology(apology.id)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl shadow-md">
                          <CategoryIcon category={apology.type} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {apology.title ||
                              apology.message ||
                              "Apology Request"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {apology.student?.user?.name ||
                                apology.student?.name ||
                                "Student"}
                            </span>
                            <span>•</span>
                            <span>
                              {formatDate(
                                apology.createdAt || apology.created_at
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
                          {apology.type || "Miscellaneous"}
                        </Badge>
                        <ApologyStatusBadge status={apology.status} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {apology.description || apology.message}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950 dark:hover:to-purple-950 transition-all"
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
                          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
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
        </div>
      </div>
    </RequireAuth>
  );
}

export default function AdminApologiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <AdminApologiesInner />
    </Suspense>
  );
}
