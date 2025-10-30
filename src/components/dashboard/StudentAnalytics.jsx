// components/dashboard/StudentAnalytics.jsx
"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, LineChart } from "@/components/ui/chart";
import { Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeStatus } from "@/lib/formatters";

export function StudentAnalytics({ complaints = [], apologies = [] }) {
  // Calculate status breakdown for complaints
  const complaintStatusData = useMemo(() => {
    const statuses = {
      open: 0,
      inprogress: 0,
      resolved: 0,
    };

    complaints.forEach((c) => {
      const status = normalizeStatus(c.status);
      if (statuses.hasOwnProperty(status)) {
        statuses[status]++;
      }
    });

    return [
      { label: "Pending", value: statuses.open, color: "#f59e0b" },
      { label: "In Progress", value: statuses.inprogress, color: "#3b82f6" },
      { label: "Resolved", value: statuses.resolved, color: "#10b981" },
    ].filter((item) => item.value > 0);
  }, [complaints]);

  // Calculate monthly submission trends
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      const monthSubmissions = complaints.filter((c) => {
        const complaintDate = new Date(c.createdAt || c.created_at || c.date);
        return (
          complaintDate.getMonth() === date.getMonth() &&
          complaintDate.getFullYear() === date.getFullYear()
        );
      });

      months.push({
        x: monthName,
        y: monthSubmissions.length,
      });
    }

    return months;
  }, [complaints]);

  // Calculate response time stats
  const avgResponseTime = useMemo(() => {
    const inProgressOrResolved = complaints.filter((c) => {
      const status = normalizeStatus(c.status);
      return status === "inprogress" || status === "resolved";
    });

    if (inProgressOrResolved.length === 0) return "N/A";

    const totalTime = inProgressOrResolved.reduce((sum, c) => {
      const created = new Date(c.createdAt || c.created_at).getTime();
      const updated = new Date(
        c.updatedAt || c.updated_at || created
      ).getTime();
      return sum + (updated - created);
    }, 0);

    const avgHours = totalTime / inProgressOrResolved.length / (1000 * 60 * 60);

    if (avgHours < 24) {
      return `${Math.round(avgHours)}h`;
    } else {
      return `${Math.round(avgHours / 24)}d`;
    }
  }, [complaints]);

  const resolutionRate = useMemo(() => {
    if (complaints.length === 0) return 0;
    const resolved = complaints.filter(
      (c) => normalizeStatus(c.status) === "resolved"
    ).length;
    return Math.round((resolved / complaints.length) * 100);
  }, [complaints]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Submissions"
          value={complaints.length + apologies.length}
          icon={AlertTriangle}
          color="indigo"
        />
        <MetricCard
          title="Pending"
          value={
            complaintStatusData.find((s) => s.label === "Pending")?.value || 0
          }
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Avg Response Time"
          value={avgResponseTime}
          icon={CheckCircle}
          color="blue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Status</CardTitle>
          </CardHeader>
          <CardContent>
            {complaintStatusData.length > 0 ? (
              <div className="flex items-center justify-center">
                <DonutChart data={complaintStatusData} size={200} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No complaints yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 && monthlyData.some((m) => m.y > 0) ? (
              <LineChart data={monthlyData} height="h-64" />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
