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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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
  estimatedCompletionDate?: string | null;
  assignedOfficerId?: string | null;
  assignedOfficerEmail?: string | null;
};

type Officer = {
  id: string;
  email: string;
  department: string;
};

const departments = ["Sanitation", "Roads", "Water", "Electricity", "Parks"];
const officerTypes = ["Roads", "Water", "Electricity", "Waste"];
// const statusOptions: Status[] = ["Open", "In Progress", "Resolved"];

const initialComplaints: Complaint[] = [
  {
    id: "CMP-0001",
    subject: "Overflowing trash bins on Churchill Ave",
    citizenName: "M. Bekele",
    department: "Sanitation",
    urgencyScore: 88,
    status: "Open",
    createdAt: "2025-09-02T09:30:00Z",
  },
  {
    id: "CMP-0002",
    subject: "Potholes causing traffic near Mexico Square",
    citizenName: "S. Alem",
    department: "Roads",
    urgencyScore: 72,
    status: "In Progress",
    createdAt: "2025-09-03T12:10:00Z",
  },
  {
    id: "CMP-0003",
    subject: "Water outage in Bole 22",
    citizenName: "H. Dawit",
    department: "Water",
    urgencyScore: 91,
    status: "Open",
    createdAt: "2025-09-01T06:15:00Z",
  },
  {
    id: "CMP-0004",
    subject: "Streetlights not working around Meskel Square",
    citizenName: "Y. Nuru",
    department: "Electricity",
    urgencyScore: 64,
    status: "Resolved",
    createdAt: "2025-08-29T18:45:00Z",
  },
  {
    id: "CMP-0005",
    subject: "Damaged benches in Sheger Park",
    citizenName: "A. Fekadu",
    department: "Parks",
    urgencyScore: 55,
    status: "Open",
    createdAt: "2025-09-04T08:05:00Z",
  },
];

export default function Page() {
  const [complaints, setComplaints] =
    React.useState<Complaint[]>(initialComplaints);
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("All");
  const [search, setSearch] = React.useState<string>("");
  const [sortByUrgencyDesc, setSortByUrgencyDesc] =
    React.useState<boolean>(true);
  const [activeTab, setActiveTab] = React.useState<"complaints" | "officers">(
    "complaints"
  );

  const [officers, setOfficers] = React.useState<Officer[]>([]);
  const [isAddOfficerOpen, setIsAddOfficerOpen] = React.useState(false);
  const [newOfficerEmail, setNewOfficerEmail] = React.useState("");
  const [newOfficerPassword, setNewOfficerPassword] = React.useState("");
  const [newOfficerDept, setNewOfficerDept] = React.useState(officerTypes[0]);

  // Assign flow dialog state
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [assignComplaintId, setAssignComplaintId] = React.useState<
    string | null
  >(null);
  const [assignOfficerId, setAssignOfficerId] = React.useState<string | null>(
    null
  );
  const [assignEstimatedDays, setAssignEstimatedDays] =
    React.useState<string>("");

  // Officer edit/delete dialogs
  const [isEditOfficerOpen, setIsEditOfficerOpen] = React.useState(false);
  const [editOfficerId, setEditOfficerId] = React.useState<string | null>(null);
  const [editOfficerEmail, setEditOfficerEmail] = React.useState<string>("");
  const [editOfficerDept, setEditOfficerDept] = React.useState<string>(
    officerTypes[0]
  );
  const [isDeleteOfficerOpen, setIsDeleteOfficerOpen] = React.useState(false);
  const [deleteOfficerId, setDeleteOfficerId] = React.useState<string | null>(
    null
  );

  // const counts = React.useMemo(() => {
  //   const open = complaints.filter((c) => c.status === "Open").length;
  //   const inProgress = complaints.filter(
  //     (c) => c.status === "In Progress"
  //   ).length;
  //   const resolved = complaints.filter((c) => c.status === "Resolved").length;
  //   return {
  //     total: complaints.length,
  //     open,
  //     inProgress,
  //     resolved,
  //   };
  // }, [complaints]);

  const visibleComplaints = React.useMemo(() => {
    setSortByUrgencyDesc(true);
    let list = complaints;
    if (departmentFilter !== "All")
      list = list.filter((c) => c.department === departmentFilter);
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
  }, [complaints, departmentFilter, search, sortByUrgencyDesc]);

  // function advanceStatus(id: string) {
  //   setComplaints((prev) =>
  //     prev.map((c) =>
  //       c.id === id ? { ...c, status: nextStatus(c.status) } : c
  //     )
  //   );
  // }

  // async function updateStatus(id: string, status: Status) {
  //   try {
  //     // Call the API endpoint to update the complaint status
  //     const res = await fetch(`/api/complaints/${id}/status`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ status }),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Failed to update status");
  //     }

  //     const updatedComplaint = await res.json();

  //     // Update local state with the response
  //     setComplaints((prev) =>
  //       prev.map((c) =>
  //         c.id === id ? { ...c, status: updatedComplaint.status } : c
  //       )
  //     );
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to update complaint status. Please try again.");
  //   }
  // }

  async function addOfficer() {
    try {
      // const res = await fetch("/api/officers", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: newOfficerEmail,
      //     password: newOfficerPassword,
      //     department: newOfficerDept,
      //   }),
      // });

      // if (!res.ok) {
      //   throw new Error("Failed to create officer");
      // }

      const createdOfficer: Officer = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        email: newOfficerEmail,
        department: newOfficerDept,
      };

      // Update local state with the newly created officer
      setOfficers((prev) => [...prev, createdOfficer]);

      // Reset modal inputs
      setNewOfficerEmail("");
      setNewOfficerPassword("");
      setNewOfficerDept(officerTypes[0]);
      setIsAddOfficerOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to create officer. Please try again.");
    }
  }

  function assignComplaintToOfficer(complaintId: string, officerId: string) {
    // Open assign dialog to capture estimated days; do not remove from list
    setAssignComplaintId(complaintId);
    setAssignOfficerId(officerId);
    setAssignEstimatedDays("");
    setIsAssignOpen(true);
  }

  function confirmAssignment() {
    if (!assignComplaintId || !assignOfficerId) {
      setIsAssignOpen(false);
      return;
    }
    const officer = officers.find((o) => o.id === assignOfficerId);
    const parsedDays = Number(assignEstimatedDays);

    // Calculate estimated completion date
    const estimatedCompletionDate =
      isFinite(parsedDays) && parsedDays > 0
        ? new Date(Date.now() + parsedDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === assignComplaintId
          ? {
              ...c,
              assignedOfficerId: assignOfficerId,
              assignedOfficerEmail: officer?.email ?? null,
              estimatedDays: parsedDays,
              estimatedCompletionDate,
            }
          : c
      )
    );
    setIsAssignOpen(false);
    setAssignComplaintId(null);
    setAssignOfficerId(null);
    setAssignEstimatedDays("");
  }

  function deleteComplaint(id: string) {
    const item = complaints.find((c) => c.id === id);
    if (!item) return;
    if (item.status !== "Resolved") return;
    setComplaints((prev) => prev.filter((c) => c.id !== id));
  }

  function openEditOfficer(officerId: string) {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;
    setEditOfficerId(officer.id);
    setEditOfficerEmail(officer.email);
    setEditOfficerDept(officer.department);
    setIsEditOfficerOpen(true);
  }

  function confirmEditOfficer() {
    if (!editOfficerId) return setIsEditOfficerOpen(false);
    setOfficers((prev) =>
      prev.map((o) =>
        o.id === editOfficerId
          ? { ...o, email: editOfficerEmail, department: editOfficerDept }
          : o
      )
    );
    setIsEditOfficerOpen(false);
    setEditOfficerId(null);
  }

  function openDeleteOfficer(officerId: string) {
    setDeleteOfficerId(officerId);
    setIsDeleteOfficerOpen(true);
  }

  function confirmDeleteOfficer() {
    if (!deleteOfficerId) return setIsDeleteOfficerOpen(false);
    setOfficers((prev) => prev.filter((o) => o.id !== deleteOfficerId));
    // Optionally unassign from complaints
    setComplaints((prev) =>
      prev.map((c) =>
        c.assignedOfficerId === deleteOfficerId
          ? { ...c, assignedOfficerId: null, assignedOfficerEmail: null }
          : c
      )
    );
    setIsDeleteOfficerOpen(false);
    setDeleteOfficerId(null);
  }

  return (
    <div className="px-6 py-8 space-y-6 text-primary-dark">
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary-dark via-secondary to-primary-light text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(60%_60%_at_50%_0%,#fff_0%,rgba(255,255,255,0)_100%)]" />
        <div className="relative p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="opacity-90">
                Assign officers, set ETA, and manage complaints.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="font-medium shadow-sm hover:bg-secondary-light text-white"
                onClick={() => setIsAddOfficerOpen(true)}
              >
                Add Officer
              </Button>
            </div>
          </div>
          {/* <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total" value={counts.total} accent="ring-white/30" />
            <StatCard label="Open" value={counts.open} accent="ring-white/30" />
            <StatCard label="In Progress" value={counts.inProgress} accent="ring-white/30" />
            <StatCard label="Resolved" value={counts.resolved} accent="ring-white/30" />
          </div> */}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:gap-3">
          <div className="flex flex-col gap-3 text-primary-dark">
            <div className="flex items-center gap-2">
              <button
                className={`rounded-md px-3 py-1.5 text-sm ring-1 transition ${
                  activeTab === "complaints"
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-background ring-muted-foreground/20 hover:bg-muted/40"
                }`}
                onClick={() => setActiveTab("complaints")}
              >
                Complaints
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm ring-1 transition ${
                  activeTab === "officers"
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-background ring-muted-foreground/20 hover:bg-muted/40"
                }`}
                onClick={() => setActiveTab("officers")}
              >
                Officers
              </button>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {activeTab === "complaints" ? (
                  <>
                    <CardTitle>Complaints</CardTitle>
                    <CardDescription>
                      Showing {visibleComplaints.length} result
                      {visibleComplaints.length !== 1 && "s"}.
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <CardTitle>Officers</CardTitle>
                    <CardDescription>
                      Manage created officers: edit details or remove.
                    </CardDescription>
                  </>
                )}
              </div>
            </div>
          </div>

          {activeTab === "complaints" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search by ID, subject, or citizen"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="transition-colors"
                />
              </div>
              <div>
                <Select
                  value={departmentFilter}
                  onValueChange={(v) => setDepartmentFilter(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="text-primary-dark">
          {activeTab === "complaints" ? (
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
                    <th className="py-2 px-2 text-left font-medium">Assign</th>
                    <th className="py-2 px-2 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleComplaints.map((c, i) => (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 pl-3 pr-2 font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{c.subject}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">{c.citizenName}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                          {c.department}
                        </span>
                      </td>
                      <td className="py-3 px-2">
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
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusClass(
                            c.status
                          )}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {c.estimatedCompletionDate
                          ? new Date(
                              c.estimatedCompletionDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          onValueChange={(v) =>
                            assignComplaintToOfficer(c.id, v)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue
                              placeholder={
                                officers.length
                                  ? "Assign Officer"
                                  : "No officers yet"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {officers.length === 0 ? (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                Add officers to assign
                              </div>
                            ) : (
                              officers.map((o) => (
                                <SelectItem key={o.id} value={o.id}>
                                  {o.email}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteComplaint(c.id)}
                          disabled={c.status !== "Resolved"}
                          title={
                            c.status !== "Resolved"
                              ? "Only resolved complaints can be deleted"
                              : "Delete complaint"
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {visibleComplaints.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center">
                        <div className="mx-auto w-full max-w-md">
                          <div className="rounded-lg border bg-card p-6">
                            <div className="mb-2 text-lg font-semibold">
                              No complaints found
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Try adjusting filters or search terms.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    <th className="py-2 pl-3 pr-2 text-left font-medium">
                      Email
                    </th>
                    <th className="py-2 px-2 text-left font-medium">
                      Department
                    </th>
                    <th className="py-2 px-2 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 pl-3 pr-2">{o.email}</td>
                      <td className="py-3 px-2">{o.department}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditOfficer(o.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteOfficer(o.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {officers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-10 text-center">
                        <div className="mx-auto w-full max-w-md">
                          <div className="rounded-lg border bg-card p-6">
                            <div className="mb-2 text-lg font-semibold">
                              No officers found
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Use Add Officer to create new officers.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Officer Modal */}
      <Dialog open={isAddOfficerOpen} onOpenChange={setIsAddOfficerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Officer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Email"
              value={newOfficerEmail}
              onChange={(e) => setNewOfficerEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={newOfficerPassword}
              onChange={(e) => setNewOfficerPassword(e.target.value)}
            />
            <Select value={newOfficerDept} onValueChange={setNewOfficerDept}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {officerTypes.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAddOfficerOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addOfficer}>Create Officer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign ETA Modal */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Estimated Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Specify estimated days to resolve after assigning the officer.
            </div>
            <Input
              type="number"
              min={1}
              placeholder="Estimated days"
              value={assignEstimatedDays}
              onChange={(e) => setAssignEstimatedDays(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssignment}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Officer Modal */}
      <Dialog open={isEditOfficerOpen} onOpenChange={setIsEditOfficerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Officer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Email"
              value={editOfficerEmail}
              onChange={(e) => setEditOfficerEmail(e.target.value)}
            />
            <Select value={editOfficerDept} onValueChange={setEditOfficerDept}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {officerTypes.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditOfficerOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditOfficer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Officer Confirm */}
      <Dialog open={isDeleteOfficerOpen} onOpenChange={setIsDeleteOfficerOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Officer</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Are you sure you want to delete this officer? This will unassign
            them from any complaints.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOfficerOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmDeleteOfficer}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// function nextStatus(s: Status): Status {
//   if (s === "Open") return "In Progress";
//   if (s === "In Progress") return "Resolved";
//   return "Resolved";
// }

function statusClass(s: Status) {
  if (s === "Open")
    return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  if (s === "In Progress")
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
}

// function StatCard({
//   label,
//   value,
//   accent,
// }: {
//   label: string;
//   value: number;
//   accent?: string;
// }) {
//   return (
//     <div
//       className={`rounded-lg border bg-white/10 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/10 ${
//         accent ?? ""
//       }`}
//     >
//       <div className="text-xs uppercase tracking-wide opacity-90">{label}</div>
//       <div className="mt-1 text-2xl font-semibold">{value}</div>
//     </div>
//   );
// }
