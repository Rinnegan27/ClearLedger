"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Plus,
  Settings,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<"thresholds" | "anomalies" | "history">("thresholds");

  const { data: thresholds, mutate: mutateThresholds } = useSWR(
    "/api/alerts/thresholds",
    fetcher
  );
  const { data: rules, mutate: mutateRules } = useSWR(
    "/api/alerts/anomaly-rules",
    fetcher
  );
  const { data: history } = useSWR("/api/alerts/history?limit=50", fetcher);

  const toggleThreshold = async (id: string, isActive: boolean) => {
    await fetch(`/api/alerts/thresholds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    mutateThresholds();
  };

  const toggleRule = async (id: string, isActive: boolean) => {
    await fetch(`/api/alerts/anomaly-rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    mutateRules();
  };

  const deleteThreshold = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    await fetch(`/api/alerts/thresholds/${id}`, { method: "DELETE" });
    mutateThresholds();
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    await fetch(`/api/alerts/anomaly-rules/${id}`, { method: "DELETE" });
    mutateRules();
  };

  const acknowledgeAlert = async (id: string) => {
    await fetch(`/api/alerts/events/${id}/acknowledge`, { method: "POST" });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-burgundy-600" />
                Smart Alerts
              </h1>
              <p className="mt-2 text-gray-600">
                Configure thresholds and anomaly detection to catch problems before they drain your budget
              </p>
            </div>
            <Button
              className="gap-2"
              onClick={() => {
                // TODO: Open create alert modal
                alert("Create alert modal - to be implemented");
              }}
            >
              <Plus className="w-4 h-4" />
              New Alert
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab("thresholds")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "thresholds"
                  ? "border-burgundy-600 text-burgundy-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Threshold Alerts
              {thresholds?.thresholds && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-burgundy-100 text-burgundy-700">
                  {thresholds.thresholds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("anomalies")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "anomalies"
                  ? "border-burgundy-600 text-burgundy-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Anomaly Detection
              {rules?.rules && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-burgundy-100 text-burgundy-700">
                  {rules.rules.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "history"
                  ? "border-burgundy-600 text-burgundy-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Alert History
              {history?.events && history.unacknowledged > 0 && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                  {history.unacknowledged}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Threshold Alerts Tab */}
        {activeTab === "thresholds" && (
          <div className="space-y-4">
            {!thresholds?.thresholds || thresholds.thresholds.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Threshold Alerts Configured
                </h3>
                <p className="text-gray-600 mb-6">
                  Set up alerts to get notified when metrics cross specific thresholds
                </p>
                <Button
                  onClick={() => alert("Create threshold alert - to be implemented")}
                >
                  Create Your First Alert
                </Button>
              </Card>
            ) : (
              thresholds.thresholds.map((threshold: any) => (
                <Card key={threshold.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {threshold.name}
                        </h3>
                        <Badge className={getSeverityColor(threshold.severity)}>
                          {threshold.severity}
                        </Badge>
                        {!threshold.isActive && (
                          <Badge className="bg-gray-100 text-gray-600">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      {threshold.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {threshold.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            Metric: <strong>{threshold.metric.toUpperCase()}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {threshold.operator.includes("decrease") ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-gray-700">
                            {threshold.operator.replace("_", " ")}{" "}
                            <strong>{threshold.threshold}</strong>
                            {threshold.operator.includes("percent") && "%"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            Lookback: <strong>{threshold.lookbackDays}d</strong>
                          </span>
                        </div>
                      </div>
                      {threshold.channel && (
                        <div className="mt-2 text-sm text-gray-600">
                          Channel: <strong>{threshold.channel.name}</strong>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          toggleThreshold(threshold.id, threshold.isActive)
                        }
                      >
                        {threshold.isActive ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          alert("Edit threshold - to be implemented")
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteThreshold(threshold.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Anomaly Detection Tab */}
        {activeTab === "anomalies" && (
          <div className="space-y-4">
            {!rules?.rules || rules.rules.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Anomaly Detection Rules
                </h3>
                <p className="text-gray-600 mb-6">
                  Use AI to automatically detect unusual patterns in your metrics
                </p>
                <Button onClick={() => alert("Create anomaly rule - to be implemented")}>
                  Create Your First Rule
                </Button>
              </Card>
            ) : (
              rules.rules.map((rule: any) => (
                <Card key={rule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rule.name}
                        </h3>
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        {!rule.isActive && (
                          <Badge className="bg-gray-100 text-gray-600">Disabled</Badge>
                        )}
                      </div>
                      {rule.description && (
                        <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            Type: <strong>{rule.type.replace("_", " ")}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">
                            Metric: <strong>{rule.metric.toUpperCase()}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">
                            Sensitivity:{" "}
                            <strong>{(rule.sensitivity * 100).toFixed(0)}%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            Window: <strong>{rule.windowDays}d</strong>
                          </span>
                        </div>
                      </div>
                      {rule.channel && (
                        <div className="mt-2 text-sm text-gray-600">
                          Channel: <strong>{rule.channel.name}</strong>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleRule(rule.id, rule.isActive)}
                      >
                        {rule.isActive ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert("Edit rule - to be implemented")}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Alert History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {!history?.events || history.events.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Alerts Triggered
                </h3>
                <p className="text-gray-600">
                  All metrics are within normal ranges. We&apos;ll notify you if anything changes.
                </p>
              </Card>
            ) : (
              history.events.map((event: any) => (
                <Card
                  key={event.id}
                  className={`p-6 ${!event.acknowledged ? "ring-2 ring-burgundy-200" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(event.dateTriggered).toLocaleDateString()}
                        </span>
                        {!event.acknowledged && (
                          <Badge className="bg-burgundy-100 text-burgundy-700">New</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {event.alertType === "threshold_violation"
                          ? "Threshold Violated"
                          : "Anomaly Detected"}
                        : {event.metric.toUpperCase()}
                      </h3>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-700">
                          Current Value: <strong>{event.metricValue.toFixed(2)}</strong>
                        </p>
                        {event.baselineValue && (
                          <p className="text-gray-700">
                            Baseline: <strong>{event.baselineValue.toFixed(2)}</strong>
                          </p>
                        )}
                        {event.deviation && (
                          <p
                            className={
                              event.deviation > 0 ? "text-green-700" : "text-red-700"
                            }
                          >
                            Deviation: <strong>{event.deviation.toFixed(1)}%</strong>
                          </p>
                        )}
                        {event.channel && (
                          <p className="text-gray-600">
                            Channel: {event.channel.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {!event.acknowledged && (
                      <Button
                        size="sm"
                        onClick={() => acknowledgeAlert(event.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
