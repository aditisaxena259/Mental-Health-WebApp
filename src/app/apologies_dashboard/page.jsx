// app/admin/dashboard/page.js
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/guard/RequireAuth";
import { api } from "@/lib/api";
import { getToken, clearAuth } from "@/lib/auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const APOLOGY_CATEGORIES = [
  { id: "all", name: "All Apologies", icon: LayoutDashboard },
  { id: "outing", name: "Outing", icon: Users },
  { id: "misconduct", name: "Misconduct", icon: AlertCircle },
];

function ApologiesDashboardInner() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apologies, setApologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReviewApology = (apologyId) => {
    router.push(`/admin/apology/${apologyId}`);
  };

  const CategoryIcon = ({ category }) => {
    const foundCategory = APOLOGY_CATEGORIES.find((cat) => cat.id === category);
    const Icon = foundCategory ? foundCategory.icon : AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  const [reviewId, setReviewId] = useState("");
  const [reviewStatus, setReviewStatus] = useState("reviewed");
  const [reviewComment, setReviewComment] = useState("");

  const token = useMemo(
    () => (typeof window !== "undefined" ? getToken() : null),
    []
  );

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        // Try admin-specific list first
        const resp = await api("/admin/apologies", { method: "GET" }, token);
        const data = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp)
          ? resp
          : [];
        setApologies(data);
      } catch (err1) {
        try {
          // Fallback to generic list if available
          const resp2 = await api("/apologies", { method: "GET" }, token);
          const data2 = Array.isArray(resp2?.data)
            ? resp2.data
            : Array.isArray(resp2)
            ? resp2
            : [];
          setApologies(data2);
        } catch (err2) {
          setError(
            (err2 instanceof Error ? err2.message : null) ||
              "Failed to load apologies"
          );
        } finally {
          setLoading(false);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredApologies = apologies
    .filter((ap) => selectedCategory === "all" || ap.type === selectedCategory)
    .filter((ap) => statusFilter === "all" || ap.status === statusFilter)
    .filter((ap) => {
      const q = searchQuery.toLowerCase();
      const title = (ap.title || "").toLowerCase();
      const msg = (ap.message || "").toLowerCase();
      const name = (
        ap.student?.user?.name ||
        ap.student?.name ||
        ""
      ).toLowerCase();
      return title.includes(q) || msg.includes(q) || name.includes(q);
    });

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

  const submitReview = async () => {
    if (!reviewId || !reviewStatus) {
      toast.error("Apology ID and status are required");
      return;
    }
    if (!token) return;
    try {
      await api(
        `/admin/apologies/${reviewId}/review`,
        {
          method: "PUT",
          body: JSON.stringify({
            comment: reviewComment,
            status: reviewStatus,
          }),
        },
        token
      );
      toast.success("Apology reviewed successfully");
      setReviewId("");
      setReviewStatus("reviewed");
      setReviewComment("");
    } catch (e) {
      toast.error(e?.message || "Failed to review apology");
    }
  };

  return (
    <RequireAuth roles={["admin"]}>
      <div className="flex min-h-screen bg-gray-50">
        <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 h-screen sticky top-0">
          <div className="p-6">
            <Link href="/landing">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <h1 className="text-xl font-bold text-indigo-900">
                  HostelCare
                </h1>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {APOLOGY_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md transition-colors ${
                    selectedCategory === category.id
                      ? "bg-indigo-50 text-indigo-900 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/warden.svg" alt="Warden" />
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Dr. Sunita Walia</p>
                    <p className="text-xs text-gray-500">Head Warden</p>
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
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Link href="/landing">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h1 className="text-xl font-bold text-indigo-900">HostelCare</h1>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside
              className="w-64 h-full bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-4 space-y-1 mt-14">
                {APOLOGY_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? "bg-indigo-50 text-indigo-900 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t">
                <button className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/warden.svg" alt="Warden" />
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Dr. Sunita Walia</p>
                    <p className="text-xs text-gray-500">Head Warden</p>
                  </div>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1  pt-16 md:pt-0">
          <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {APOLOGY_CATEGORIES.find((cat) => cat.id === selectedCategory)
                    ?.name || "All Apologies"}
                </h1>
                <p className="text-gray-600">Manage Student Apologies</p>
              </div>

              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group"
                variant="default"
              >
                <FileText className="h-4 w-4 group-hover:animate-pulse" />
                Generate Monthly Report
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
              </Button>
            </div>

            {/* Quick Review form (temporary until list endpoint is available) */}
            <div className="grid md:grid-cols-3 gap-3 mb-6 mt-6 bg-white border rounded-lg p-4">
              <div className="space-y-1">
                <Label htmlFor="apologyId">Apology ID</Label>
                <Input
                  id="apologyId"
                  placeholder="UUID"
                  value={reviewId}
                  onChange={(e) => setReviewId(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="apologyStatus">Status</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger id="apologyStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="apologyComment">Comment</Label>
                <Input
                  id="apologyComment"
                  placeholder="Optional comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button onClick={submitReview}>Submit Review</Button>
              </div>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <Search className="h-4 w-4" />
                </div>
                <Input
                  placeholder="Search apologies, students or room numbers..."
                  className="pl-10 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg shadow-sm transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 md:gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] border-gray-200 hover:border-indigo-300 rounded-lg shadow-sm transition-all duration-200 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    <div className="flex items-center gap-2">
                      <FilterIcon className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-md shadow-lg border-gray-200 overflow-hidden">
                    <div className="py-2 px-3 bg-indigo-50 border-b border-gray-100">
                      <p className="text-xs font-medium text-indigo-800">
                        Filter by Status
                      </p>
                    </div>
                    <SelectItem
                      value="all"
                      className="focus:bg-indigo-50 focus:text-indigo-900"
                    >
                      <div className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4" />
                        <span>All Statuses</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="submitted">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span>Submitted</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="reviewed">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        <span>Reviewed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="accepted">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Accepted</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500" />
                        <span>Rejected</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden md:block">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-gray-200 hover:border-indigo-300 rounded-lg shadow-sm transition-all duration-200 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        <span>Advanced</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 rounded-md shadow-lg border-gray-200">
                      <div className="p-3 bg-indigo-50 border-b border-gray-100">
                        <h3 className="font-medium text-indigo-900">
                          Advanced Filters
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="date-range">Date Range</Label>
                          <Select defaultValue="last-week">
                            <SelectTrigger id="date-range">
                              <SelectValue placeholder="Select date range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="yesterday">
                                Yesterday
                              </SelectItem>
                              <SelectItem value="last-week">
                                Last 7 days
                              </SelectItem>
                              <SelectItem value="last-month">
                                Last 30 days
                              </SelectItem>
                              <SelectItem value="custom">
                                Custom range
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category"> Apology Category</Label>
                          <Select defaultValue="all">
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Categories
                              </SelectItem>
                              <SelectItem value="maintenance">
                                Maintenance
                              </SelectItem>
                              <SelectItem value="cleaning">Cleaning</SelectItem>
                              <SelectItem value="network">
                                Network Issues
                              </SelectItem>
                              <SelectItem value="room">Room Issues</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Reset
                          </Button>
                          <Button size="sm">Apply Filters</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Apologies list */}
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{error}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // simple retry
                        if (!token) return;
                        (async () => {
                          setLoading(true);
                          setError("");
                          try {
                            const resp = await api(
                              "/admin/apologies",
                              { method: "GET" },
                              token
                            );
                            const data = Array.isArray(resp?.data)
                              ? resp.data
                              : Array.isArray(resp)
                              ? resp
                              : [];
                            setApologies(data);
                          } catch (err1) {
                            try {
                              const resp2 = await api(
                                "/apologies",
                                { method: "GET" },
                                token
                              );
                              const data2 = Array.isArray(resp2?.data)
                                ? resp2.data
                                : Array.isArray(resp2)
                                ? resp2
                                : [];
                              setApologies(data2);
                            } catch (err2) {
                              setError(
                                (err2 instanceof Error ? err2.message : null) ||
                                  "Failed to load apologies"
                              );
                            } finally {
                              setLoading(false);
                            }
                          } finally {
                            setLoading(false);
                          }
                        })();
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}
              {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  Loading...
                </div>
              ) : filteredApologies.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No apologies found
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? "Try adjusting your search or filters"
                      : "There are no apologies in this category yet"}
                  </p>
                </div>
              ) : (
                filteredApologies.map((apology) => (
                  <div
                    key={apology.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
                    onClick={() => handleReviewApology(apology.id)}
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md">
                            <CategoryIcon category={apology.category} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 capitalize">
                              {apology.type || apology.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                              <span>
                                {apology.student?.user?.name ||
                                  apology.studentName ||
                                  "Student"}
                              </span>
                              <span>•</span>
                              {apology.roomNumber ? (
                                <span>Room {apology.roomNumber}</span>
                              ) : null}
                              <span>•</span>
                              <span>
                                {new Date(
                                  apology.created_at || apology.date
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Badge variant="outline" className="capitalize">
                          {apology.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}

export default function ApologiesDashboardPage() {
  return (
    <Suspense fallback={null}>
      <ApologiesDashboardInner />
    </Suspense>
  );
}
