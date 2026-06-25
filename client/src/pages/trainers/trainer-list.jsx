import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, BookOpen, Search, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

function SalaryBadge({ status }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Paid
      </span>
    );
  }
  if (status === "advance") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Advance Given
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      Not Paid
    </span>
  );
}

export default function TrainerList() {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainers, isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await API.get("/trainers");
      return res.data.data || [];
    }
  });

  const { data: salaryStatus } = useQuery({
    queryKey: ["trainer-salary-status"],
    queryFn: async () => {
      const res = await API.get("/trainers/salary-status");
      return res.data.data || {};
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => API.delete(`/trainers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      queryClient.invalidateQueries({ queryKey: ["trainer-salary-status"] });
      toast({ title: "Trainer deleted successfully" });
      setConfirmState({ open: false, id: null, name: "" });
    },
    onError: (err) => {
      toast({
        title: "Failed to delete trainer",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
      setConfirmState({ open: false, id: null, name: "" });
    }
  });

  const filtered = (trainers || []).filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = t.fullName?.toLowerCase().includes(q) || t.phone?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q);
    const matchGender = genderFilter === "all" || t.gender === genderFilter;
    const trainerStatus = salaryStatus?.[t._id] || "unpaid";
    const matchStatus = statusFilter === "all" || trainerStatus === statusFilter;
    return matchSearch && matchGender && matchStatus;
  });

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Trainers Directory</h2>
        <Link to="/trainers/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Register Trainer</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="relative sm:col-span-5">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <Input placeholder="Search by name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="sm:col-span-2">
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Salary Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid This Month</SelectItem>
              <SelectItem value="advance">Advance Given</SelectItem>
              <SelectItem value="unpaid">Not Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 flex items-center px-3 text-sm text-stone-500 border border-stone-200 rounded-md bg-stone-50">
          {filtered.length} trainer(s)
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-x-auto bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Salary Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-stone-500 py-6">
                    {search || genderFilter !== "all" || statusFilter !== "all" ? "No trainers match your filters." : "No trainers registered yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-semibold text-stone-900">{t.fullName}</TableCell>
                    <TableCell>{t.gender || "N/A"}</TableCell>
                    <TableCell>{t.phone}</TableCell>
                    <TableCell>{t.email || "N/A"}</TableCell>
                    <TableCell>PKR {t.baseSalary}</TableCell>
                    <TableCell>
                      <SalaryBadge status={salaryStatus?.[t._id] || "unpaid"} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/trainers/${t._id}/ledger`}>
                        <Button size="sm" className="h-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg">
                          <BookOpen className="mr-2 h-4 w-4" /> Payments
                        </Button>
                      </Link>
                      <Link to={`/trainers/edit/${t._id}`}>
                        <Button size="icon" className="h-8 w-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        className="h-8 w-8 bg-white text-rose-600 hover:bg-rose-50 border border-rose-300 rounded-lg"
                        onClick={() => setConfirmState({ open: true, id: t._id, name: t.fullName })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title="Delete Trainer"
        message={`Are you sure you want to delete "${confirmState.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={() => deleteMutation.mutate(confirmState.id)}
        onCancel={() => setConfirmState({ open: false, id: null, name: "" })}
      />
    </div>
  );
}
