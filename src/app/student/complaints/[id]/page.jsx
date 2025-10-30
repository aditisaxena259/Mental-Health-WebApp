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
  FileText,
  ImageIcon,
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
import { PriorityBadge } from "@/components/shared/StatusBadges";

export default function StudentComplaintDetail({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const complaintId = unwrappedParams.id;
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    if (!token) return;

    try {
      // Send the text message
      if (newMessage.trim()) {
        const entry = await api(
          `/complaints/${complaintId}/timeline`,
          {
            method: "POST",
            body: JSON.stringify({ message: newMessage }),
          },
          token
        );
        setTimeline((prev) => [...prev, entry]);
      }

      // Handle file attachment if present
      if (selectedFile) {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result;
          const meta = [];
          if (selectedFile.type) meta.push(`type=${selectedFile.type}`);
          if (selectedFile.size) meta.push(`size=${selectedFile.size}B`);
          const suffix = meta.length ? ` [${meta.join(", ")}]` : "";

          try {
            const fileEntry = await api(
              `/complaints/${complaintId}/timeline`,
              {
                method: "POST",
                body: JSON.stringify({
                  message: `📎 Attachment: ${selectedFile.name}${suffix}|||${base64Data}`,
                }),
              },
              token
            );
            setTimeline((prev) => [...prev, fileEntry]);
            toast.success("File attached successfully");
          } catch (err) {
            toast.error(err?.message || "Failed to attach file");
          }
        };
        reader.readAsDataURL(selectedFile);
      }

      setNewMessage("");
      setSelectedFile(null);
      const input = document.getElementById("student-attach-input");
      if (input) input.value = "";

      if (!selectedFile) {
        toast.success("Message sent");
      }
    } catch (e) {
      toast.error(e?.message || "Failed to send message");
    }
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
        id: "resolved",
        label: "Resolved",
        completed: status === "resolved",
        current: status === "resolved",
      },
    ];
  };

  return (
    <RequireAuth roles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Back button and complaint title */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to complaints
            </Button>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {complaint?.title || "Loading..."}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">
                    ID: {complaint?.id || complaintId}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {complaint?.date ? formatDate(complaint.date) : "..."}
                  </span>
                  {complaint?.priority ? (
                    <>
                      <span>•</span>
                      <PriorityBadge priority={complaint.priority} />
                    </>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(complaint?.status || "open")}
              </div>
            </div>
          </div>

          {/* Progress tracker */}
          <Card className="mb-6 border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    Progress Tracker
                  </h3>
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
                    {Math.round(calculateProgress())}% Complete
                  </span>
                </div>
                <Progress
                  value={calculateProgress()}
                  className="h-3 bg-gray-200 dark:bg-gray-800"
                />
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {getProgressSteps().map((step, index) => (
                    <div key={step.id} className="relative">
                      <div
                        className={`text-center space-y-2 p-3 rounded-xl transition-all ${
                          step.completed
                            ? "bg-green-50 dark:bg-green-950"
                            : step.current
                            ? "bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-200 dark:ring-blue-800"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex justify-center">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                              step.completed
                                ? "bg-green-500 shadow-lg shadow-green-500/50"
                                : step.current
                                ? "bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : step.current ? (
                              <Clock className="h-5 w-5 text-white" />
                            ) : (
                              <div className="h-3 w-3 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-xs font-medium ${
                            step.completed
                              ? "text-green-700 dark:text-green-300"
                              : step.current
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {index < getProgressSteps().length - 1 && (
                        <div
                          className={`hidden md:block absolute top-7 left-full w-full h-0.5 -translate-y-1/2 ${
                            step.completed
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                          style={{
                            width: "calc(100% - 2rem)",
                            left: "calc(50% + 1rem)",
                          }}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaint details */}
          <Card className="mb-6 border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-b">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="h-5 w-5 text-indigo-600" />
                Complaint Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-foreground whitespace-pre-line leading-relaxed mb-6 text-base">
                {complaint?.description || "Loading complaint details..."}
              </p>

              {complaint?.attachments && complaint.attachments.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-indigo-600" />
                    Attachments ({complaint.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {complaint.attachments.map((attachment, index) => (
                      <div
                        key={attachment.id || `attachment-${index}`}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md"
                      >
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                          <Paperclip className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {attachment.size}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950"
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
          <Card className="mb-6 border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-2xl overflow-hidden">
            <Tabs defaultValue="timeline" className="w-full">
              <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                    Communication History
                  </CardTitle>
                  <TabsList className="bg-white/50 dark:bg-gray-800/50 border">
                    <TabsTrigger
                      value="timeline"
                      className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger
                      value="respond"
                      className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Respond
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TabsContent value="timeline" className="mt-0 space-y-6">
                  {timeline.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-muted-foreground">No updates yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Updates will appear here as your complaint progresses
                      </p>
                    </div>
                  ) : (
                    [...timeline].reverse().map((item, idx) => (
                      <div
                        key={item.id}
                        className="relative pl-8 pb-6 before:absolute before:left-3 before:top-3 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-indigo-200 before:to-transparent dark:before:from-indigo-800 last:before:h-0"
                      >
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50 flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
                          {item.type === "status-change" ? (
                            <Clock className="h-3 w-3 text-white" />
                          ) : (
                            <MessageSquare className="h-3 w-3 text-white" />
                          )}
                        </div>

                        {item.type === "status-change" ? (
                          <div className="bg-indigo-50 dark:bg-indigo-950/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900">
                            <p className="text-sm text-foreground">
                              Status changed to{" "}
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {item.status}
                              </span>
                              {item.user !== "system" && item?.user?.name && (
                                <>
                                  {" "}
                                  by{" "}
                                  <span className="font-medium">
                                    {item.user.name}
                                  </span>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.timestamp ? formatDate(item.timestamp) : ""}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-8 w-8 border-2 border-indigo-200 dark:border-indigo-800">
                                {item?.user?.avatar ? (
                                  <AvatarImage
                                    src={item.user.avatar}
                                    alt={item.user.name || "User"}
                                  />
                                ) : null}
                                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold">
                                  {item?.user?.name
                                    ? item.user.name.charAt(0)
                                    : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {item?.user?.name ?? "User"}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {item.timestamp
                                    ? formatDate(item.timestamp)
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <div className="pl-0">
                              {(() => {
                                const message = item.content ?? item.message;
                                // Check if this is a file attachment with base64 data
                                const attachmentMatch = message?.match(
                                  /📎 Attachment: (.+?) \[type=(.+?), size=(\d+)B\]\|\|\|(.+)/
                                );

                                // Also check for old format without base64
                                const oldAttachmentMatch =
                                  !attachmentMatch &&
                                  message?.match(
                                    /📎 Attachment: (.+?) \[type=(.+?), size=(\d+)B\]/
                                  );

                                if (attachmentMatch) {
                                  const [
                                    ,
                                    filename,
                                    fileType,
                                    fileSize,
                                    base64Data,
                                  ] = attachmentMatch;
                                  const fileSizeKB = (
                                    parseInt(fileSize) / 1024
                                  ).toFixed(1);
                                  const isImage = fileType.startsWith("image/");
                                  const isPDF = fileType === "application/pdf";

                                  return (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl">
                                        <Paperclip className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-sm text-indigo-800 dark:text-indigo-300 flex-1 font-medium">
                                          {filename} ({fileSizeKB} KB)
                                        </span>
                                      </div>

                                      {isImage && (
                                        <div className="relative w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                                          <img
                                            src={base64Data}
                                            alt={filename}
                                            className="w-full max-h-96 object-contain"
                                          />
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="absolute top-2 right-2"
                                            onClick={() => {
                                              window.open(base64Data, "_blank");
                                            }}
                                          >
                                            Open in New Tab
                                          </Button>
                                        </div>
                                      )}

                                      {isPDF && (
                                        <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <FileText className="h-12 w-12 text-red-600" />
                                              <div>
                                                <p className="text-sm font-medium text-foreground">
                                                  PDF Document
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {filename}
                                                </p>
                                              </div>
                                            </div>
                                            <Button
                                              type="button"
                                              size="sm"
                                              onClick={() => {
                                                window.open(
                                                  base64Data,
                                                  "_blank"
                                                );
                                              }}
                                            >
                                              Open PDF
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                // Handle old format attachments (without base64)
                                if (oldAttachmentMatch) {
                                  const [, filename, fileType, fileSize] =
                                    oldAttachmentMatch;
                                  const fileSizeKB = (
                                    parseInt(fileSize) / 1024
                                  ).toFixed(1);
                                  const isImage = fileType.startsWith("image/");
                                  const isPDF = fileType === "application/pdf";

                                  return (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl">
                                        <Paperclip className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-sm text-indigo-800 dark:text-indigo-300 flex-1 font-medium">
                                          {filename} ({fileSizeKB} KB)
                                        </span>
                                      </div>

                                      {isPDF && (
                                        <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                                          <div className="flex items-center gap-3">
                                            <FileText className="h-10 w-10 text-red-600" />
                                            <div className="flex-1">
                                              <p className="text-sm font-medium text-foreground">
                                                PDF Document
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {filename}
                                              </p>
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-2 italic">
                                            Note: File preview not available for
                                            attachments sent before the update.
                                          </p>
                                        </div>
                                      )}

                                      {isImage && (
                                        <div className="p-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                                          <div className="flex items-center gap-3 p-2">
                                            <ImageIcon className="h-10 w-10 text-indigo-600" />
                                            <div className="flex-1">
                                              <p className="text-sm font-medium text-foreground">
                                                Image File
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {filename}
                                              </p>
                                            </div>
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-2 italic px-2">
                                            Note: Image preview not available
                                            for attachments sent before the
                                            update.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                // Regular text message
                                return (
                                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                                    {message}
                                  </p>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="respond" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Your Message
                    </label>
                    <Textarea
                      placeholder="Type your message here... Ask questions or provide additional information."
                      className="min-h-[140px] resize-none border-2 focus:border-indigo-300 dark:focus:border-indigo-700"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Attachment (Optional)
                    </label>
                    <input
                      id="student-attach-input"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {!selectedFile ? (
                      <div
                        onClick={() =>
                          document
                            .getElementById("student-attach-input")
                            ?.click()
                        }
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 transition-all"
                      >
                        <Paperclip className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to attach a file
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, or PDF - max 5MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-xl">
                          <Paperclip className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-800 dark:text-green-300 flex-1 font-medium">
                            {selectedFile.name} (
                            {(selectedFile.size / 1024).toFixed(1)} KB)
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              const input = document.getElementById(
                                "student-attach-input"
                              );
                              if (input) input.value = "";
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            ×
                          </Button>
                        </div>

                        {selectedFile.type.startsWith("image/") && (
                          <div className="relative w-full h-48 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
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
                                const url = URL.createObjectURL(selectedFile);
                                window.open(url, "_blank");
                              }}
                            >
                              Open in New Tab
                            </Button>
                          </div>
                        )}

                        {selectedFile.type === "application/pdf" && (
                          <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-12 w-12 text-red-600" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    PDF Document
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {selectedFile.name}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  const url = URL.createObjectURL(selectedFile);
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
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && !selectedFile}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Provide Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Satisfaction Feedback</DialogTitle>
                    <DialogDescription>
                      Please rate your satisfaction with the resolution of this
                      complaint.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6 space-y-6">
                    <div className="flex justify-center gap-6">
                      <button
                        className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                          satisfaction === true
                            ? "border-green-500 bg-green-50 dark:bg-green-950 shadow-lg shadow-green-500/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-950/50"
                        }`}
                        onClick={() => setSatisfaction(true)}
                      >
                        <div
                          className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                            satisfaction === true
                              ? "bg-green-500 shadow-lg shadow-green-500/50"
                              : "bg-gray-100 dark:bg-gray-800 group-hover:bg-green-100 dark:group-hover:bg-green-900"
                          }`}
                        >
                          <ThumbsUp
                            className={`h-8 w-8 transition-all ${
                              satisfaction === true
                                ? "text-white"
                                : "text-gray-400 group-hover:text-green-600"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-base font-semibold ${
                            satisfaction === true
                              ? "text-green-700 dark:text-green-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          Satisfied
                        </span>
                      </button>
                      <button
                        className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                          satisfaction === false
                            ? "border-red-500 bg-red-50 dark:bg-red-950 shadow-lg shadow-red-500/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50/50 dark:hover:bg-red-950/50"
                        }`}
                        onClick={() => setSatisfaction(false)}
                      >
                        <div
                          className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                            satisfaction === false
                              ? "bg-red-500 shadow-lg shadow-red-500/50"
                              : "bg-gray-100 dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-900"
                          }`}
                        >
                          <ThumbsDown
                            className={`h-8 w-8 transition-all ${
                              satisfaction === false
                                ? "text-white"
                                : "text-gray-400 group-hover:text-red-600"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-base font-semibold ${
                            satisfaction === false
                              ? "text-red-700 dark:text-red-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          Unsatisfied
                        </span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="feedback"
                        className="text-sm font-semibold text-foreground"
                      >
                        Additional Comments (Optional)
                      </label>
                      <Textarea
                        id="feedback"
                        placeholder="Please share your thoughts on how this complaint was handled..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={4}
                        className="resize-none border-2 focus:border-indigo-300 dark:focus:border-indigo-700"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setFeedbackDialogOpen(false)}
                      className="border-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={satisfaction === null}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
                    >
                      Submit Feedback
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
