// app/student/complaints/[id]/page.js
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
  XCircle,
  AlertCircle,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import RequireAuth from "@/components/guard/RequireAuth";

export default function StudentComplaintDetail({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const complaintId = unwrappedParams.id;
  const [newMessage, setNewMessage] = useState("");
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [satisfaction, setSatisfaction] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? getToken() : null;

  useEffect(() => {
    if (
      !token ||
      !complaintId ||
      complaintId === "undefined" ||
      complaintId === "null"
    ) {
      return;
    }

    // Fetch all student complaints to find this one
    // (there's no single complaint GET endpoint for students)
    api(`/student/complaints`, { method: "GET" }, token)
      .then((response) => {
        const complaints = response?.data || [];
        const found = complaints.find((c) => c.id === complaintId);
        if (found) {
          setComplaint(found);
        } else {
          toast.error("Complaint not found");
        }
        setLoading(false);
      })
      .catch((e) => {
        toast.error(e?.message || "Failed to load complaint");
        setLoading(false);
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
        toast.success("Message sent");
      })
      .catch((e) => toast.error(e?.message || "Failed to send message"));
  };

  const handleSubmitFeedback = () => {
    if (!token) return;
    const summary = satisfaction === true ? "Satisfied" : "Unsatisfied";
    const msg = `Student feedback: ${summary}${
      feedbackComment ? `\nComment: ${feedbackComment}` : ""
    }`;
    api(
      `/complaints/${complaintId}/timeline`,
      {
        method: "POST",
        body: JSON.stringify({ message: msg }),
      },
      token
    )
      .then((entry) => {
        setTimeline((prev) => [...prev, entry]);
        toast.success("Feedback submitted");
        setFeedbackDialogOpen(false);
        setSatisfaction(null);
        setFeedbackComment("");
      })
      .catch((e) => toast.error(e?.message || "Failed to submit feedback"));
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

  // Calculate progress percentage based on completed steps
  const calculateProgress = () => {
    if (!complaint?.progressSteps || complaint.progressSteps.length === 0) {
      // Default progress based on status
      const status = complaint?.status || "open";
      if (status === "resolved") return 100;
      if (status === "inprogress") return 50;
      return 25;
    }

    const totalSteps = complaint.progressSteps.length;
    const completedSteps = complaint.progressSteps.filter(
      (step) => step.completed
    ).length;
    const currentStep = complaint.progressSteps.findIndex(
      (step) => step.current
    );

    // If there's a current step, add half a step to the progress
    return (
      ((completedSteps + (currentStep !== -1 ? 0.5 : 0)) / totalSteps) * 100
    );
  };

  const getProgressSteps = () => {
    if (complaint?.progressSteps) return complaint.progressSteps;

    // Generate default progress steps based on status
    const status = complaint?.status || "open";
    return [
      {
        id: "submitted",
        label: "Submitted",
        completed: true,
        current: status === "open",
      },
      {
        id: "in-review",
        label: "In Review",
        completed: status !== "open",
        current: status === "inprogress",
      },
      {
        id: "assigned",
        label: "Assigned",
        completed: status === "resolved",
        current: false,
      },
      {
        id: "resolved",
        label: "Resolved",
        completed: status === "resolved",
        current: status === "resolved",
      },
    ];
  };

  return (
    <RequireAuth roles={["student"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back button and complaint title */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-2 pl-0 hover:bg-transparent hover:text-indigo-700"
              onClick={() => router.push("/student/dashboard")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to complaints
            </Button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {complaint?.title || "Loading..."}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>Complaint #{complaint?.id || complaintId}</span>
                  <span>•</span>
                  <span>
                    Reported on{" "}
                    {complaint?.date ? formatDate(complaint.date) : "..."}
                  </span>
                </div>
              </div>
              <div>{getStatusBadge(complaint?.status || "open")}</div>
            </div>
          </div>

          {/* Progress tracker */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Complaint Progress</h3>
                  <span className="text-sm text-gray-600">
                    {Math.round(calculateProgress())}% Complete
                  </span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  {getProgressSteps().map((step) => (
                    <div key={step.id} className="space-y-1">
                      <div
                        className={`h-6 w-6 rounded-full mx-auto flex items-center justify-center ${
                          step.completed
                            ? "bg-green-100"
                            : step.current
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : step.current ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          step.completed
                            ? "text-green-700 font-medium"
                            : step.current
                            ? "text-blue-700 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaint details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line mb-6">
                {complaint?.description || "Loading complaint details..."}
              </p>

              {complaint?.attachments && complaint.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
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
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attachment.size}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (attachment?.url) {
                              window.open(attachment.url, "_blank");
                            } else {
                              toast.error("No attachment URL available");
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
            </CardContent>
          </Card>

          {/* Timeline and responses */}
          <Card className="mb-6">
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
                            <span className="font-medium">{item.status}</span>
                            {item.user !== "system" && item?.user?.name && (
                              <> by {item.user.name}</>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.timestamp ? formatDate(item.timestamp) : ""}
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
                    placeholder="Type your message here..."
                    className="min-h-[120px]"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <div className="flex justify-between">
                    <input
                      id="student-attach-input"
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target?.files?.[0];
                        if (!f) return;
                        if (!token) return;
                        try {
                          const meta = [];
                          if (f.type) meta.push(`type=${f.type}`);
                          if (f.size) meta.push(`size=${f.size}B`);
                          const suffix = meta.length
                            ? ` [${meta.join(", ")}]`
                            : "";
                          const entry = await api(
                            `/complaints/${complaintId}/timeline`,
                            {
                              method: "POST",
                              body: JSON.stringify({
                                message: `Attachment noted: ${f.name}${suffix}`,
                              }),
                            },
                            token
                          );
                          setTimeline((prev) => [...prev, entry]);
                          toast.success("Attachment noted");
                        } catch (err2) {
                          toast.error(
                            err2?.message || "Failed to note attachment"
                          );
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("student-attach-input")?.click()
                      }
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            {complaint?.status === "resolved" ? (
              <Dialog
                open={feedbackDialogOpen}
                onOpenChange={setFeedbackDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Provide Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Satisfaction Feedback</DialogTitle>
                    <DialogDescription>
                      Please rate your satisfaction with the resolution of this
                      complaint.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex justify-center gap-6">
                      <button
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${
                          satisfaction === true
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSatisfaction(true)}
                      >
                        <ThumbsUp
                          className={`h-8 w-8 ${
                            satisfaction === true
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            satisfaction === true
                              ? "text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          Satisfied
                        </span>
                      </button>
                      <button
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${
                          satisfaction === false
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSatisfaction(false)}
                      >
                        <ThumbsDown
                          className={`h-8 w-8 ${
                            satisfaction === false
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            satisfaction === false
                              ? "text-red-700"
                              : "text-gray-600"
                          }`}
                        >
                          Unsatisfied
                        </span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="feedback" className="text-sm font-medium">
                        Additional Comments
                      </label>
                      <Textarea
                        id="feedback"
                        placeholder="Please share your thoughts on how this complaint was handled..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setFeedbackDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={satisfaction === null}
                    >
                      Submit Feedback
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    if (!token) return;
                    // Try multiple DELETE endpoints to fully remove the complaint
                    const endpoints = [
                      `/student/complaints/${complaintId}`,
                      `/complaints/${complaintId}`,
                      `/admin/complaints/${complaintId}`,
                    ];
                    let deleted = false;
                    for (const path of endpoints) {
                      try {
                        await api(path, { method: "DELETE" }, token);
                        deleted = true;
                        break;
                      } catch (_) {
                        // try next
                      }
                    }
                    if (deleted) {
                      toast.success("Complaint cancelled and removed");
                      router.push("/student/dashboard");
                    } else {
                      toast.error(
                        "Failed to delete complaint. Please try again later."
                      );
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Complaint
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      // Attempt to set priority to high via admin endpoint if available
                      await api(
                        `/admin/complaints/${complaintId}/priority`,
                        {
                          method: "PUT",
                          body: JSON.stringify({ priority: "high" }),
                        },
                        token
                      );
                    } catch (_) {
                      // ignore failures; backend may not expose this endpoint
                    }
                    try {
                      const entry = await api(
                        `/complaints/${complaintId}/timeline`,
                        {
                          method: "POST",
                          body: JSON.stringify({
                            message:
                              "Student requested urgent review (set priority: high)",
                          }),
                        },
                        token
                      );
                      setTimeline((prev) => [...prev, entry]);
                      toast.success("Urgent review requested");
                    } catch (e) {
                      toast.error(
                        e?.message || "Failed to request urgent review"
                      );
                    }
                  }}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request Urgent Review
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
