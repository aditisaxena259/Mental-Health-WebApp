"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  UserCircle,
  Calendar,
  FileText,
  AlertCircle,
  Paperclip,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import RequireAuth from "@/components/guard/RequireAuth";

export default function StudentApologyDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const apologyId = unwrappedParams.id;
  const [apology, setApology] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? getToken() : null;

  useEffect(() => {
    if (!token || !apologyId) return;

    const fetchApology = async () => {
      setLoading(true);
      try {
        // Fetch all student apologies
        const data = await api("/student/apologies", { method: "GET" }, token);

        const apologies = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        const found = apologies.find((a) => a.id === apologyId);

        if (found) {
          setApology(found);
        } else {
          toast.error("Apology not found");
          router.push("/student/apologies");
        }
      } catch (e) {
        toast.error(e?.message || "Failed to load apology");
        router.push("/student/apologies");
      } finally {
        setLoading(false);
      }
    };

    fetchApology();
  }, [apologyId, token, router]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border-2 border-green-200 dark:border-green-800 shadow-lg shadow-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 hover:from-red-200 hover:to-rose-200 border-2 border-red-200 dark:border-red-800 shadow-lg shadow-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "reviewed":
        return (
          <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 hover:from-blue-200 hover:to-indigo-200 border-2 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Reviewed
          </Badge>
        );
      case "submitted":
      default:
        return (
          <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 hover:from-amber-200 hover:to-orange-200 border-2 border-amber-200 dark:border-amber-800 shadow-lg shadow-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        );
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      outing:
        "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 dark:border-blue-800 shadow-blue-500/20",
      misconduct:
        "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200 dark:border-red-800 shadow-red-500/20",
      miscellaneous:
        "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200 dark:border-purple-800 shadow-purple-500/20",
    };
    return (
      <Badge
        className={`${
          colors[type] || "bg-gray-100 text-card-foreground border-gray-200"
        } border-2 shadow-lg`}
      >
        {type?.charAt(0).toUpperCase() + type?.slice(1) || "Unknown"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <RequireAuth roles={["student"]}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading apology details...</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!apology) {
    return (
      <RequireAuth roles={["student"]}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Apology not found
            </h2>
            <Link href="/student/apologies">
              <Button variant="outline">Back to My Apologies</Button>
            </Link>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth roles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Apologies
            </Button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Apology Letter
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">
                    ID: {apology?.id || apologyId}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Submitted on{" "}
                    {formatDate(apology.created_at || apology.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(apology.status)}
                {getTypeBadge(apology.type)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Apology Details */}
              <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Apology Letter Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                        Message
                      </h3>
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
                        {apology.message || apology.title}
                      </p>
                    </div>
                    {apology.description && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-gray-600 to-slate-600"></div>
                          Additional Details
                        </h3>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base">
                          {apology.description}
                        </p>
                      </div>
                    )}

                    {/* Attachments Section */}
                    {apology?.attachments && apology.attachments.length > 0 && (
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-indigo-600" />
                          Attachments ({apology.attachments.length})
                        </h3>
                        <div className="space-y-2">
                          {apology.attachments.map((attachment, index) => (
                            <div
                              key={attachment.id || `attachment-${index}`}
                              className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md"
                            >
                              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                                <Paperclip className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {attachment.name ||
                                    attachment.filename ||
                                    "Attachment"}
                                </p>
                                {attachment.size && (
                                  <p className="text-xs text-muted-foreground">
                                    {attachment.size}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950"
                                onClick={() => {
                                  if (attachment.url) {
                                    window.open(attachment.url, "_blank");
                                  } else {
                                    toast.info("Attachment URL not available");
                                  }
                                }}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Admin Feedback */}
              {apology.comment && (
                <Card className="rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-xl shadow-blue-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-300 text-lg">
                      <div className="h-8 w-8 rounded-lg bg-blue-200 dark:bg-blue-900 flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                      </div>
                      Admin Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-900 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
                        {apology.comment}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status Information */}
              <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <AlertCircle className="h-5 w-5 text-indigo-600" />
                    Review Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 rounded-xl border border-gray-200 dark:border-gray-800">
                      <span className="text-sm font-medium text-muted-foreground">
                        Current Status:
                      </span>
                      <div>{getStatusBadge(apology.status)}</div>
                    </div>

                    {apology.status === "submitted" && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-lg shadow-amber-500/10">
                        <div className="text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2 font-medium">
                          <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                          </div>
                          <span>
                            Your apology is awaiting review by the admin.
                          </span>
                        </div>
                      </div>
                    )}

                    {apology.status === "reviewed" && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-lg shadow-blue-500/10">
                        <div className="text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2 font-medium">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span>
                            Your apology has been reviewed. A decision will be
                            made soon.
                          </span>
                        </div>
                      </div>
                    )}

                    {apology.status === "accepted" && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 shadow-lg shadow-green-500/10">
                        <div className="text-sm text-green-900 dark:text-green-200 flex items-center gap-2 font-medium">
                          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span>Your apology has been accepted.</span>
                        </div>
                      </div>
                    )}

                    {apology.status === "rejected" && (
                      <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg shadow-red-500/10">
                        <div className="text-sm text-red-900 dark:text-red-200 flex items-center gap-2 font-medium">
                          <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span>
                            Your apology was not accepted. Please check the
                            admin feedback above.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Timeline */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Submitted */}
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/50 ring-4 ring-white dark:ring-gray-900">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-semibold text-foreground">
                          Submitted
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(apology.created_at || apology.createdAt)}
                        </p>
                      </div>
                    </div>
                    {apology.status !== "submitted" && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-amber-200 to-blue-200 dark:from-amber-800 dark:to-blue-800"></div>
                    )}
                  </div>

                  {/* Reviewed */}
                  {apology.status !== "submitted" && (
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/50 ring-4 ring-white dark:ring-gray-900">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-sm font-semibold text-foreground">
                            Reviewed
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(
                              apology.updated_at || apology.updatedAt
                            )}
                          </p>
                        </div>
                      </div>
                      {(apology.status === "accepted" ||
                        apology.status === "rejected") && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-green-200 dark:from-blue-800 dark:to-green-800"></div>
                      )}
                    </div>
                  )}

                  {/* Accepted */}
                  {apology.status === "accepted" && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/50 ring-4 ring-white dark:ring-gray-900">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-semibold text-foreground">
                          Accepted
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(apology.updated_at || apology.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rejected */}
                  {apology.status === "rejected" && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/50 ring-4 ring-white dark:ring-gray-900">
                        <XCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-semibold text-foreground">
                          Rejected
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(apology.updated_at || apology.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-b">
                  <CardTitle className="text-lg text-foreground">
                    Apology Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    {getTypeBadge(apology.type)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {apology.type === "outing" &&
                      "Request for permission to leave campus"}
                    {apology.type === "misconduct" &&
                      "Apology for behavioral misconduct"}
                    {apology.type === "miscellaneous" &&
                      "Other apology or request"}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-2 backdrop-blur-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/50 dark:to-purple-950/50 shadow-xl shadow-indigo-500/10 border-indigo-100 dark:border-indigo-900">
                <CardHeader className="border-b border-indigo-200 dark:border-indigo-800">
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <UserCircle className="h-5 w-5 text-indigo-600" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    If you have questions about your apology status, contact the
                    warden.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 dark:hover:border-indigo-700"
                    onClick={() =>
                      (window.location.href =
                        "mailto:hostel.warden@university.edu")
                    }
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Contact Warden
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
