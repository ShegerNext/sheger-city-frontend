"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/clerk-react";
import { officerTranslation } from "@/Translation/officerTranslation";
import { useLanguage } from "@/context/LanguageContext";

const BASE_URL = process.env.NEXT_PUBLIC_API;

type Status = "Open" | "In Progress" | "Resolved";

type Complaint = {
  id: string;
  subject: string;
  citizenName: string;
  department: string;
  urgencyScore: number;
  status: Status;
  createdAt: string;
  estimatedDays?: number | null;
  estimatedCompletionDate: string;
  assignedOfficerId?: string | null;
  assignedOfficerEmail?: string | null;
  imageUrl?: string | null;
  description?: string | null;
};

// Define the API response type
type ApiComplaint = {
  _id: string;
  category: string;
  userId: string;
  urgency: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  estimatedTime?: string;
  assigned_officer_id?: string;
  description?: string;
};

const role = "Electricity-Officer";

const analyticsCards = (analytics: {
  total: number;
  open: number;
  inProg: number;
  resolved: number;
}) => [
  {
    key: "total",
    title: "Total",
    description: "Visible complaints",
    value: analytics.total,
    colorClass: "text-primary-dark",
  },
  {
    key: "open",
    title: "Open",
    description: "Needs attention",
    value: analytics.open,
    colorClass: "text-amber-600",
  },
  {
    key: "inProg",
    title: "In Progress",
    description: "Being handled",
    value: analytics.inProg,
    colorClass: "text-blue-600",
  },
  {
    key: "resolved",
    title: "Resolved",
    description: "Completed",
    value: analytics.resolved,
    colorClass: "text-emerald-600",
  },
];

function nextStatus(s: Status): Status {
  if (s === "Open") return "In Progress";
  if (s === "In Progress") return "Resolved";
  return "Resolved";
}

function statusClass(s: Status) {
  if (s === "Open")
    return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  if (s === "In Progress")
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Page() {
  const { user } = useUser();
  const officerId = user?.id; // Clerk user ID
  const { lang } = useLanguage();
  const t = officerTranslation[lang];

  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [sortByUrgencyDesc] = React.useState<boolean>(true);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [viewComplaintId, setViewComplaintId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    if (!officerId) return;
    console.log(officerId);
    const fetchComplaints = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/complaints/officer?id=${officerId}`
        );
        const data: ApiComplaint[] = await res.json();
        const mapped: Complaint[] = data.map((c) => ({
          id: c._id,
          subject: c.category,
          citizenName: c.userId ?? "Unknown",
          department: c.category,
          urgencyScore:
            c.urgency === "high" ? 90 : c.urgency === "medium" ? 70 : 40,
          status:
            c.status === "open"
              ? "Open"
              : c.status === "in_progress"
              ? "In Progress"
              : "Resolved",
          createdAt: c.createdAt,
          estimatedDays: c.estimatedTime
            ? Math.ceil(
                (new Date(c.estimatedTime).getTime() -
                  new Date(c.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
          estimatedCompletionDate: c.estimatedTime || "",
          assignedOfficerId: c.assigned_officer_id,
          description: c.description,
        }));
        setComplaints(mapped);
      } catch (err) {
        console.error("Error fetching complaints", err);
      }
    };
    fetchComplaints();
  }, [officerId]);

  async function advanceStatus(id: string) {
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) return;

    const newStatus = nextStatus(complaint.status);

    try {
      await fetch(`${BASE_URL}/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status:
            newStatus === "Open"
              ? "open"
              : newStatus === "In Progress"
              ? "in_progress"
              : "resolved",
        }),
      });

      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  }

  /* ------------------ View Complaint ------------------ */
  async function openView(id: string) {
    setViewComplaintId(id);
    try {
      // Fixed the API endpoint - removed the "/api" prefix
      const res = await fetch(`${BASE_URL}/complaints/${id}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Complaint detail:", data);
    } catch (err) {
      console.error("Failed to fetch complaint details", err);
    }
    setIsViewOpen(true);
  }

  const visibleComplaints = React.useMemo(() => {
    let list = complaints;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.citizenName.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) =>
      sortByUrgencyDesc
        ? b.urgencyScore - a.urgencyScore
        : a.urgencyScore - b.urgencyScore
    );
    return list;
  }, [complaints, search, sortByUrgencyDesc]);

  const analytics = React.useMemo(() => {
    const total = visibleComplaints.length;
    const open = visibleComplaints.filter((c) => c.status === "Open").length;
    const inProg = visibleComplaints.filter(
      (c) => c.status === "In Progress"
    ).length;
    const resolved = visibleComplaints.filter(
      (c) => c.status === "Resolved"
    ).length;
    return { total, open, inProg, resolved };
  }, [visibleComplaints]);

  const selectedComplaint = React.useMemo(
    () => complaints.find((c) => c.id === viewComplaintId) || null,
    [complaints, viewComplaintId]
  );

  return (
    <div className="px-6 py-8 space-y-6 text-primary-dark">
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary-dark via-secondary to-primary-light text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(60%_60%_at_50%_0%,#fff_0%,rgba(255,255,255,0)_100%)]" />
        <div className="relative p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {t.dashboard}
              </h1>
              <p className="opacity-90">{t.dashboardDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-white/10 px-3 py-1 text-sm ring-1 ring-white/30">
                {t.role} <span className="ml-1 font-medium">{role}</span>
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analyticsCards(analytics).map((card) => (
              <div
                key={card.key}
                className="rounded-lg border bg-white/10 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/10"
              >
                <div className="text-xs uppercase tracking-wide opacity-90">
                  {card.title}
                </div>
                <div className={`mt-1 text-2xl font-semibold `}>
                  {card.value}
                </div>
                <div className="text-xs opacity-80">{card.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-primary-dark">
            <div>
              <CardTitle>{t.complaints}</CardTitle>
              <CardDescription>
                {t.complaintsDescription(analytics.total)}
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Input
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="transition-colors"
              />
            </div>
            <div className="hidden lg:block" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="py-2 pl-3 pr-2 text-left font-medium">
                    {t.table.id}
                  </th>
                  <th className="py-2 px-2 text-left font-medium">
                    {t.table.subject}
                  </th>
                  <th className="py-2 px-2 text-left font-medium">
                    {t.table.citizen}
                  </th>
                  <th className="py-2 px-2 text-left font-medium">
                    {t.table.department}
                  </th>
                  <th className="py-2 px-2 text-left font-medium">
                    {t.table.urgency}
                  </th>
                  <th className="py-2 px-2 text-left font-medium">
                    {t.table.status}
                  </th>
                  <th className="py-2 px-2 text-left font-medium">
                    {t.table.estimatedCompletion}
                  </th>
                  <th className="py-2 px-2 text-right font-medium">
                    {t.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleComplaints.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 text-primary-dark hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 pl-3 pr-2 align-top font-mono text-xs text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="py-3 px-2 align-top">
                      <div className="max-w-[520px] truncate font-medium">
                        {c.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-2 align-top">{c.citizenName}</td>
                    <td className="py-3 px-2 align-top">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                        {c.department}
                      </span>
                    </td>
                    <td className="py-3 px-2 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                          c.urgencyScore >= 80
                            ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                            : c.urgencyScore >= 60
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        }`}
                      >
                        {c.urgencyScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-2 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusClass(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 align-top">
                      {c.estimatedCompletionDate
                        ? new Date(
                            c.estimatedCompletionDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-2 align-top">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => advanceStatus(c.id)}
                          disabled={c.status === "Resolved"}
                          title={
                            c.status === "Resolved"
                              ? t.resolved
                              : `Set to ${nextStatus(c.status)}`
                          }
                        >
                          {c.status === "Resolved"
                            ? t.resolved
                            : t.advanceStatus}
                        </Button>
                        <Button size="sm" onClick={() => openView(c.id)}>
                          {t.view}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleComplaints.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="mx-auto w-full max-w-md">
                        <div className="rounded-lg border bg-card p-6">
                          <div className="mb-2 text-lg font-semibold">
                            {t.noComplaintsFound}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t.noComplaintsFoundDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* View Complaint Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.modal.complaintDetails}</DialogTitle>
          </DialogHeader>
          {selectedComplaint ? (
            <div className="space-y-4">
              {/* Image / Placeholder */}
              <div className="overflow-hidden rounded-md border bg-muted">
                {selectedComplaint.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedComplaint.imageUrl}
                    alt="Complaint related"
                    className="h-40 w-full object-cover sm:h-52"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center text-xs text-muted-foreground sm:h-52">
                    {t.modal.noImage}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-base font-semibold leading-snug break-words">
                  {selectedComplaint.subject}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{selectedComplaint.id}</span>
                  <span>•</span>
                  <span>{formatDate(selectedComplaint.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                    {selectedComplaint.department}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusClass(
                      selectedComplaint.status
                    )}`}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedComplaint.description ? (
                <div className="rounded-md border p-3 text-sm leading-relaxed">
                  {selectedComplaint.description}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t.modal.citizen}
                  </div>
                  <div className="text-sm font-medium">
                    {selectedComplaint.citizenName}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t.modal.estimatedDays}
                  </div>
                  <div className="text-sm font-medium">
                    {selectedComplaint.estimatedDays &&
                    selectedComplaint.estimatedDays > 0
                      ? `${selectedComplaint.estimatedDays} day${
                          selectedComplaint.estimatedDays === 1 ? "" : "s"
                        }`
                      : "-"}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t.modal.assignedOfficer}
                  </div>
                  <div className="text-sm font-medium">
                    {selectedComplaint.assignedOfficerEmail || "-"}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">{t.modal.tip}</div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedComplaint && (
              <Button
                variant="outline"
                onClick={() => advanceStatus(selectedComplaint.id)}
                disabled={selectedComplaint.status === "Resolved"}
                title={
                  selectedComplaint.status === "Resolved"
                    ? t.resolved
                    : `Set to ${nextStatus(selectedComplaint.status)}`
                }
              >
                {selectedComplaint.status === "Resolved"
                  ? t.resolved
                  : t.advanceStatus}
              </Button>
            )}
            <Button onClick={() => setIsViewOpen(false)}>
              {t.modal.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
