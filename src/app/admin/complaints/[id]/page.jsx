// app/admin/complaints/[id]/page.js
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  MessageSquare,
  Paperclip,
  Send,
  CheckCircle,
  UserCircle,
  Calendar,
  MapPin,
  Tag,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import RequireAuth from "@/components/guard/RequireAuth";
import { PriorityBadge } from "@/components/shared/StatusBadges";

export default function ComplaintDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const complaintId = unwrappedParams.id;
  const [newMessage, setNewMessage] = useState("");
  const [newStatus, setNewStatus] = useState("open");
  const [newPriority, setNewPriority] = useState("medium");
  const [timeline, setTimeline] = useState([]);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const token = typeof window !== "undefined" ? getToken() : null;
  // Derive UI priority; timeline can imply high priority via urgent review
  const [uiPriority, setUiPriority] = useState("medium");

  useEffect(() => {
    if (!token || !complaintId) return;

    // Try to fetch single complaint first, fall back to list if not available
    api(`/admin/complaints/${complaintId}`, { method: "GET" }, token)
      .then((data) => {
        setComplaint(data);
        setNewStatus(data.status || "open");
        setNewPriority(data.priority || "medium");
        setLoading(false);
      })
      .catch((firstError) => {
        // If single complaint fetch fails, try to get from list
        api(`/admin/complaints`, { method: "GET" }, token)
          .then((response) => {
            const complaints = response?.data || response || [];
            const found = Array.isArray(complaints)
              ? complaints.find((c) => c.id === complaintId)
              : null;
            if (found) {
              setComplaint(found);
              setNewStatus(found.status || "open");
              setNewPriority(found.priority || "medium");
            } else {
              toast.error("Complaint not found");
            }
            setLoading(false);
          })
          .catch((e) => {
            toast.error(e?.message || "Failed to load complaint");
            setLoading(false);
          });
      });

    // Fetch timeline
    api(`/complaints/${complaintId}/timeline`, { method: "GET" }, token)
      .then((entries) => {
        if (Array.isArray(entries)) setTimeline(entries);
      })
      .catch((e) => {
        // Timeline fetch failed - this might be expected if timeline doesn't exist yet
        console.warn("Timeline fetch failed:", e);
      });
  }, [complaintId, token]);

  // Infer high priority from timeline messages even if backend doesn't persist it
  useEffect(() => {
    const impliedHigh = timeline.some((t) => {
      const text = (t?.message || t?.content || "").toString();
      return /urgent\s*review|priority\s*:\s*high/i.test(text);
    });
    const base = complaint?.priority || newPriority || "medium";
    setUiPriority(impliedHigh ? "high" : base);
  }, [timeline, complaint, newPriority]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (!token) return;
    api(
      `/complaints/${complaintId}/timeline`,
      {
        method: "POST",
        body: JSON.stringify({ message: newMessage }),
      },
      token
    )
      .then((entry) => {
        setTimeline((prev) => [...prev, entry]);
        setNewMessage("");
        toast.success("Response sent");
      })
      .catch((e) => toast.error(e?.message || "Failed to send response"));
  };

  const handleStatusChange = (status) => {
    setNewStatus(status);
    if (!token) return;
    api(
      `/admin/complaints/${complaintId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
      token
    )
      .then(async () => {
        toast.success("Status updated");
        // Ensure timeline reflects the change
        try {
          const entry = await api(
            `/complaints/${complaintId}/timeline`,
            {
              method: "POST",
              body: JSON.stringify({ message: `Status updated to: ${status}` }),
            },
            token
          );
          setTimeline((prev) => [...prev, entry]);
        } catch (_) {
          // ignore timeline errors to avoid blocking UI
        }
      })
      .catch((e) => toast.error(e?.message || "Failed to update status"));
  };

  const handlePriorityChange = (priority) => {
    setNewPriority(priority);
    if (!token) return;
    // Record priority change in timeline (no dedicated API available)
    api(
      `/complaints/${complaintId}/timeline`,
      {
        method: "POST",
        body: JSON.stringify({ message: `Priority updated to: ${priority}` }),
      },
      token
    )
      .then((entry) => {
        setTimeline((prev) => [...prev, entry]);
        toast.success("Priority noted in timeline");
      })
      .catch((e) =>
        toast.error(e?.message || "Failed to record priority change")
      );
  };

  const handleMarkResolved = () => handleStatusChange("resolved");

  const getStudentEmail = () =>
    complaint?.user?.email || complaint?.student?.user?.email || "";

  const handleScheduleMeeting = () => {
    const email = getStudentEmail();
    if (!email) {
      toast.error("Student email not available");
      return;
    }
    const subject = encodeURIComponent(
      `Meeting regarding Complaint #${complaint?.id || complaintId}`
    );
    const body = encodeURIComponent(
      `Hello,\n\nI'd like to schedule a meeting to discuss your complaint #${
        complaint?.id || complaintId
      }.\nPlease share your availability.\n\nThanks.`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleForward = () => {
    if (!token) return;
    api(
      `/complaints/${complaintId}/timeline`,
      {
        method: "POST",
        body: JSON.stringify({ message: "Forwarded to Senior Warden." }),
      },
      token
    )
      .then((entry) => {
        setTimeline((prev) => [...prev, entry]);
        toast.success("Forwarded note added to timeline");
      })
      .catch((e) => toast.error(e?.message || "Failed to forward"));
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleDeleteComplaint = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this complaint? This action cannot be undone."
      )
    ) {
      return;
    }

    if (!token) return;

    try {
      await api(
        `/admin/complaints/${complaintId}`,
        { method: "DELETE" },
        token
      );
      toast.success("Complaint deleted successfully");
      router.push("/admin/complaints");
    } catch (error) {
      toast.error(error?.message || "Failed to delete complaint");
    }
  };

  const onAttachmentView = (att) => {
    if (att?.url) {
      window.open(att.url, "_blank");
    } else {
      toast.error("No attachment URL available");
    }
  };

  const fileInputId = "admin-attach-input";
  const handlePickFile = () => {
    const el = document.getElementById(fileInputId);
    if (el) el.click();
  };
  const handleFileSelected = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!token) return;
    // Backend has no attachment storage; just note the filename in the timeline
    try {
      const meta = [];
      if (file.type) meta.push(`type=${file.type}`);
      if (file.size) meta.push(`size=${file.size}B`);
      const suffix = meta.length ? ` [${meta.join(", ")}]` : "";
      const entry = await api(
        `/complaints/${complaintId}/timeline`,
        {
          method: "POST",
          body: JSON.stringify({
            message: `Attachment noted: ${file.name}${suffix}`,
          }),
        },
        token
      );
      setTimeline((prev) => [...prev, entry]);
      toast.success("Attachment noted in timeline");
    } catch (e2) {
      toast.error(e2?.message || "Failed to note attachment");
    }
  };

  const formatDate = (dateString) => {
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
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Resolved
          </Badge>
        );
      case "inprogress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            In Progress
          </Badge>
        );
      case "open":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Open
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Low Priority
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <RequireAuth roles={["admin"]}>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Back button and complaint title */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-2 pl-0 hover:bg-transparent "
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to complaints
            </Button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {complaint?.title || "Loading..."}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>Complaint #{complaint?.id || complaintId}</span>
                  <span>•</span>
                  <span>
                    Reported on{" "}
                    {complaint?.date ? formatDate(complaint.date) : "..."}
                  </span>
                  {uiPriority || complaint?.priority ? (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center">
                        <PriorityBadge
                          priority={uiPriority || complaint?.priority}
                        />
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(uiPriority)}
                {getStatusBadge(complaint?.status || newStatus)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content - complaint details and timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Complaint details */}
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line mb-6">
                    {complaint?.description || "Loading complaint details..."}
                  </p>

                  {complaint?.attachments &&
                    complaint.attachments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-foreground mb-2">
                          Attachments
                        </h3>
                        <div className="space-y-2">
                          {complaint.attachments.map((attachment, index) => (
                            <div
                              key={attachment.id || `attachment-${index}`}
                              className="flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-gray-50"
                            >
                              <Paperclip className="h-4 w-4 text-gray-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {attachment.size}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAttachmentView(attachment)}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Timeline and responses */}
              <Card>
                <Tabs defaultValue="timeline">
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <CardTitle>Communication History</CardTitle>
                      <TabsList>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="respond">Respond</TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="timeline" className="mt-4 space-y-6">
                      {timeline.map((item) => (
                        <div
                          key={item.id}
                          className="relative pl-6 pb-6 before:absolute before:left-2 before:top-2 before:h-full before:w-[1px] before:bg-gray-200 last:before:h-0"
                        >
                          <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center">
                            {item.type === "status-change" ? (
                              <Clock className="h-2 w-2 text-indigo-700" />
                            ) : (
                              <MessageSquare className="h-2 w-2 text-indigo-700" />
                            )}
                          </div>

                          {item.type === "status-change" ? (
                            <div>
                              <p className="text-sm text-gray-600">
                                Status changed to{" "}
                                <span className="font-medium">
                                  {item.status}
                                </span>
                                {item.user !== "system" && item?.user?.name && (
                                  <> by {item.user.name}</>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.timestamp
                                  ? formatDate(item.timestamp)
                                  : ""}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  {item?.user?.avatar ? (
                                    <AvatarImage
                                      src={item.user.avatar}
                                      alt={item.user.name || "User"}
                                    />
                                  ) : null}
                                  <AvatarFallback>
                                    {item?.user?.name
                                      ? item.user.name.charAt(0)
                                      : "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {item?.user?.name ?? "User"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.timestamp
                                      ? formatDate(item.timestamp)
                                      : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="pl-8">
                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                  {item.content ?? item.message}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="respond" className="mt-4 space-y-4">
                      <Textarea
                        placeholder="Type your response here..."
                        className="min-h-[120px]"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <div className="flex justify-between">
                        <input
                          id={fileInputId}
                          type="file"
                          className="hidden"
                          onChange={handleFileSelected}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePickFile}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attach File
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Response
                        </Button>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar - student info and actions */}
            <div className="space-y-6">
              {/* Student information */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src="/avatars/student.svg"
                        alt={complaint?.studentName || "Student"}
                      />
                      <AvatarFallback>
                        {complaint?.studentName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {complaint?.studentName || "Loading..."}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {complaint?.studentId || "..."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          Room {complaint?.roomNumber || "..."}
                        </p>
                        <p className="text-xs text-gray-600">
                          {complaint?.block || "..."},{" "}
                          {complaint?.floor || "..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <UserCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          B.Tech, Computer Science
                        </p>
                        <p className="text-xs text-gray-600">3rd Year</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Resident Since</p>
                        <p className="text-xs text-gray-600">August 2022</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Complaint History</p>
                        <p className="text-xs text-gray-600">
                          2 previous complaints
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <UserCircle className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Update Status</label>
                    <Select
                      value={newStatus}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="inprogress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Update Priority
                    </label>
                    <Select
                      value={newPriority}
                      onValueChange={handlePriorityChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Removed redundant Mark as Resolved button */}

                  <div className="space-y-2 pt-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleScheduleMeeting}
                    >
                      Schedule Meeting
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleForward}
                    >
                      Forward to Senior Warden
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handlePrint}
                    >
                      Print Complaint
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={handleDeleteComplaint}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Complaint
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
