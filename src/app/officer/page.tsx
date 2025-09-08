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

const departments = ["Sanitation", "Roads", "Water", "Electricity", "Parks"];
const role = "Electricity-Officer";
const officerId = "officer-1";

// Dummy assigned complaints for this officer (simulate API result)
const assignedComplaints: Complaint[] = [
  {
    id: "CMP-1023",
    subject: "Transformer outage near Piassa",
    citizenName: "N. Gebremedhin",
    department: "Electricity",
    urgencyScore: 86,
    status: "Open",
    createdAt: "2025-09-05T07:20:00Z",
    estimatedDays: 3,
    estimatedCompletionDate: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString(),
    assignedOfficerId: officerId,
    assignedOfficerEmail: "officer.electricity@sheger.gov",
    imageUrl: "/images/landingPageSlidingWindow/addis1.jpg",
    description:
      "Multiple households reported a transformer failure near Piassa. Power is out on the north block. Residents noted a loud pop before outage.",
  },
  {
    id: "CMP-1041",
    subject: "Streetlights flickering at Sar Bet",
    citizenName: "B. Mulu",
    department: "Electricity",
    urgencyScore: 64,
    status: "In Progress",
    createdAt: "2025-09-04T19:10:00Z",
    estimatedDays: 2,
    estimatedCompletionDate: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString(),
    assignedOfficerId: officerId,
    assignedOfficerEmail: "officer.electricity@sheger.gov",
    imageUrl: null,
    description:
      "Several poles report intermittent flicker around 8–10pm. Likely a ballast or timer controller issue.",
  },
  {
    id: "CMP-1087",
    subject: "Power surge damaging appliances in Gerji",
    citizenName: "S. Daniel",
    department: "Electricity",
    urgencyScore: 92,
    status: "Open",
    createdAt: "2025-09-03T11:45:00Z",
    estimatedDays: null,
    estimatedCompletionDate: "",
    assignedOfficerId: officerId,
    assignedOfficerEmail: "officer.electricity@sheger.gov",
    imageUrl: "/images/landingPageSlidingWindow/addis2.jpg",
    description:
      "Reports of repeated voltage spikes causing device failures. Needs urgent inspection and possible line regulator calibration.",
  },
];

/* ------------------ Card Config ------------------ */
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

// function urgencyColor(score: number) {
//   if (score >= 80) return "text-red-600";
//   if (score >= 60) return "text-amber-600";
//   return "text-emerald-600";
// }

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Page() {
  const [complaints, setComplaints] =
    React.useState<Complaint[]>(assignedComplaints);
  // const [departmentFilter, setDepartmentFilter] = React.useState<string>("All");
  const [search, setSearch] = React.useState<string>("");
  const [sortByUrgencyDesc] =
    React.useState<boolean>(true);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [viewComplaintId, setViewComplaintId] = React.useState<string | null>(
    null
  );
  // const [activeTab, setActiveTab] = React.useState<"complaints" | "officers">(
  //   "complaints"
  // );

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
    const avgUrgency =
      total === 0
        ? 0
        : Math.round(
            visibleComplaints.reduce((s, c) => s + c.urgencyScore, 0) / total
          );
    const byDept = departments.map((d) => ({
      dept: d,
      count: visibleComplaints.filter((c) => c.department === d).length,
    }));
    return { total, open, inProg, resolved, avgUrgency, byDept };
  }, [visibleComplaints]);

  function advanceStatus(id: string) {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: nextStatus(c.status) } : c
      )
    );
  }

  function openView(id: string) {
    setViewComplaintId(id);
    setIsViewOpen(true);
  }

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
                Officer Dashboard
              </h1>
              <p className="opacity-90">
                Manage department complaints, and update statuses.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-white/10 px-3 py-1 text-sm ring-1 ring-white/30">
                Role: <span className="ml-1 font-medium">{role}</span>
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
              <CardTitle>Complaints</CardTitle>
              <CardDescription>
                Sort by urgency, update status. Showing {analytics.total} result
                {analytics.total === 1 ? "" : "s"}.
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by ID, subject, or citizen"
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
                  <th className="py-2 pl-3 pr-2 text-left font-medium">ID</th>
                  <th className="py-2 px-2 text-left font-medium">Subject</th>
                  <th className="py-2 px-2 text-left font-medium">Citizen</th>
                  <th className="py-2 px-2 text-left font-medium">
                    Department
                  </th>
                  <th className="py-2 px-2 text-left font-medium">Urgency</th>
                  <th className="py-2 px-2 text-left font-medium">Status</th>
                  <th className="py-2 px-2 text-left font-medium">
                    Estimated Completion
                  </th>
                  <th className="py-2 px-2 text-right font-medium">Actions</th>
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
                              ? "Already resolved"
                              : `Set to ${nextStatus(c.status)}`
                          }
                        >
                          {c.status === "Resolved"
                            ? "Resolved"
                            : "Advance Status"}
                        </Button>
                        <Button size="sm" onClick={() => openView(c.id)}>
                          View
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
                            No complaints found
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting search or sorting.
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
            <DialogTitle>Complaint Details</DialogTitle>
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
                    No image provided
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
                  <div className="text-xs text-muted-foreground">Citizen</div>
                  <div className="text-sm font-medium">
                    {selectedComplaint.citizenName}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">
                    Estimated (days)
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
                    Assigned Officer
                  </div>
                  <div className="text-sm font-medium">
                    {selectedComplaint.assignedOfficerEmail || "-"}
                  </div>
                </div>
                {/* <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Urgency</div>
                  <div className="text-sm font-medium mb-2">
                    {selectedComplaint.urgencyScore}/100
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, selectedComplaint.urgencyScore)
                        )}%`,
                      }}
                    />
                  </div>
                </div> */}
              </div>

              <div className="text-xs text-muted-foreground">
                Tip: You can advance status here or from the table.
              </div>
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
                    ? "Already resolved"
                    : `Set to ${nextStatus(selectedComplaint.status)}`
                }
              >
                {selectedComplaint.status === "Resolved"
                  ? "Resolved"
                  : "Advance Status"}
              </Button>
            )}
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
