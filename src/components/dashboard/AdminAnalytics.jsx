// components/dashboard/AdminAnalytics.jsx
"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, DonutChart, LineChart } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeStatus } from "@/lib/formatters";

export function AdminAnalytics({ complaints = [], apologies = [] }) {
  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const counts = {};
    complaints.forEach((c) => {
      const type = c.type || "other";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value,
        color: getCategoryColor(label),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [complaints]);

  // Calculate status breakdown
  const statusData = useMemo(() => {
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
      { label: "Open", value: statuses.open, color: "#f59e0b" },
      { label: "In Progress", value: statuses.inprogress, color: "#3b82f6" },
      { label: "Resolved", value: statuses.resolved, color: "#10b981" },
    ].filter((item) => item.value > 0);
  }, [complaints]);

  // Calculate monthly trends (last 6 months)
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      const monthComplaints = complaints.filter((c) => {
        const complaintDate = new Date(c.createdAt || c.created_at || c.date);
        return (
          complaintDate.getMonth() === date.getMonth() &&
          complaintDate.getFullYear() === date.getFullYear()
        );
      });

      months.push({
        x: monthName,
        y: monthComplaints.length,
      });
    }

    return months;
  }, [complaints]);

  // Calculate resolution rate trend
  const resolutionTrend = useMemo(() => {
    if (complaints.length === 0) return 0;

    const resolved = complaints.filter(
      (c) => normalizeStatus(c.status) === "resolved"
    ).length;
    const total = complaints.length;
    const currentRate = (resolved / total) * 100;

    // Simulated previous period rate (you can calculate from actual data)
    const previousRate = 85;

    return currentRate - previousRate;
  }, [complaints]);

  // Calculate average resolution time
  const avgResolutionTime = useMemo(() => {
    const resolvedComplaints = complaints.filter(
      (c) => normalizeStatus(c.status) === "resolved" && c.resolvedAt
    );

    if (resolvedComplaints.length === 0) return "N/A";

    const totalTime = resolvedComplaints.reduce((sum, c) => {
      const created = new Date(c.createdAt || c.created_at).getTime();
      const resolved = new Date(c.resolvedAt).getTime();
      return sum + (resolved - created);
    }, 0);

    const avgHours = totalTime / resolvedComplaints.length / (1000 * 60 * 60);

    if (avgHours < 24) {
      return `${Math.round(avgHours)}h`;
    } else {
      return `${Math.round(avgHours / 24)}d`;
    }
  }, [complaints]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Complaints"
          value={complaints.length}
          icon={Activity}
          trend={
            monthlyData.length > 1
              ? monthlyData[monthlyData.length - 1].y -
                monthlyData[monthlyData.length - 2].y
              : 0
          }
        />
        <MetricCard
          title="Resolution Rate"
          value={`${
            statusData.find((s) => s.label === "Resolved")?.value || 0
          }/${complaints.length}`}
          icon={Target}
          trend={resolutionTrend}
          suffix="%"
        />
        <MetricCard
          title="Avg Resolution Time"
          value={avgResolutionTime}
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Issues"
          value={statusData.find((s) => s.label === "Open")?.value || 0}
          icon={Activity}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <BarChart data={categoryData} height="h-64" />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="flex items-center justify-center">
                <DonutChart data={statusData} size={200} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
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

function MetricCard({ title, value, icon: Icon, trend, suffix = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            {typeof trend === "number" && trend !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  trend > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {Math.abs(trend)}
                  {suffix}
                </span>
              </div>
            )}
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

function getCategoryColor(category) {
  const colors = {
    plumbing: "#3b82f6",
    electricity: "#f59e0b",
    cleanliness: "#10b981",
    roommate: "#8b5cf6",
    "lost-found": "#ec4899",
    other: "#6b7280",
  };
  return colors[category] || colors.other;
}
