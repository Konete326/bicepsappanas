import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { formatDate } from "@/utils/format";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function MemberList() {
  const [searchParams] = useSearchParams();
  const dueTodayParam = searchParams.get("dueToday") === "true";
  const [search, setSearch] = useState("");
  const [showTodayOnly, setShowTodayOnly] = useState(dueTodayParam);
  const [paymentStatus, setPaymentStatus] = useState(dueTodayParam ? "unpaid" : "all");
  const [gender, setGender] = useState("all");
  const [joiningDateFilter, setJoiningDateFilter] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("all");
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", search],
    queryFn: async () => {
      const res = await API.get("/members", { params: { search } });
      return res.data.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return API.delete(`/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({ title: "Member successfully deleted" });
    },
    onError: (err) => {
      toast({
        title: "Error deleting member",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (member) => {
    setConfirmState({ open: true, id: member._id, name: member.fullName });
  };

  const confirmDelete = () => {
    deleteMutation.mutate(confirmState.id);
    setConfirmState({ open: false, id: null, name: "" });
  };

  const cancelDelete = () => {
    setConfirmState({ open: false, id: null, name: "" });
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case "Active": return <Badge variant="default">Active</Badge>;
      case "Expired": return <Badge variant="destructive">Expired</Badge>;
      default: return <Badge variant="secondary">{s}</Badge>;
    }
  };

  const getPaymentStatus = (renewalDate) => {
    if (!renewalDate) return { label: "Unpaid", value: "unpaid", className: "bg-red-50 text-red-700 border-red-200/50 hover:bg-red-50/80" };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(renewalDate);
    renewal.setHours(0, 0, 0, 0);

    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: "Unpaid", value: "unpaid", className: "bg-red-50 text-red-700 border-red-200/50 hover:bg-red-50/80" };
    } else if (diffDays <= 7) {
      return { label: "Due Soon", value: "due_soon", className: "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-50/80" };
    } else {
      return { label: "Paid", value: "paid", className: "bg-green-50 text-green-700 border-green-200/50 hover:bg-green-50/80" };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Members Directory</h2>
        <Link to="/members/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Register Member</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
          <Input
            placeholder="Search name/roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs border-stone-200 focus:border-stone-400 rounded-lg placeholder:text-[10px]"
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            type="date"
            value={joiningDateFilter}
            onChange={(e) => setJoiningDateFilter(e.target.value)}
            className="w-full h-8 text-xs border-stone-200 focus:border-stone-400 rounded-lg px-2"
            placeholder="Joining Date"
          />
        </div>
        <div className="sm:col-span-2">
          <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
            <SelectTrigger className="w-full h-8 text-xs border-stone-200 focus:border-stone-400 rounded-lg px-2">
              <SelectValue placeholder="Plan Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Special">Special</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Cardio">Cardio</SelectItem>
              <SelectItem value="CrossFit">CrossFit</SelectItem>
              <SelectItem value="Personal Training">Personal Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Button
            type="button"
            variant={showTodayOnly ? "default" : "outline"}
            className="w-full h-8 text-xs font-semibold rounded-lg"
            onClick={() => setShowTodayOnly(!showTodayOnly)}
          >
            {showTodayOnly ? "Today Only" : "Show Today"}
          </Button>
        </div>
        <div className="sm:col-span-2">
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger className="w-full h-8 text-xs border-stone-200 focus:border-stone-400 rounded-lg px-2">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="due_soon">Due Soon</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-full h-8 text-xs border-stone-200 focus:border-stone-400 rounded-lg px-2">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Surname</TableHead>
                <TableHead>Membership Type</TableHead>
                <TableHead>Cell Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const list = members || [];
                const filteredList = list.filter((member) => {
                  const matchesPayment = paymentStatus === "all" || getPaymentStatus(member.renewalDate).value === paymentStatus;
                  const matchesGender = gender === "all" || member.gender === gender;
                  const matchesType = memberTypeFilter === "all" || member.memberType === memberTypeFilter;
                  
                  let matchesDate = true;
                  if (joiningDateFilter && member.joiningDate) {
                    const filterDay = Number(joiningDateFilter.split('-')[2]);
                    const formatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'Asia/Karachi' });
                    const memberDay = Number(formatter.format(new Date(member.joiningDate)));
                    matchesDate = filterDay === memberDay;
                  }
                  
                  let matchesToday = true;
                  if (showTodayOnly && member.joiningDate) {
                    const formatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'Asia/Karachi' });
                    const todayDay = Number(formatter.format(new Date()));
                    const memberDay = Number(formatter.format(new Date(member.joiningDate)));
                    matchesToday = todayDay === memberDay;
                  }
                  
                  return matchesPayment && matchesGender && matchesDate && matchesType && matchesToday;
                });
                if (filteredList.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-stone-500 py-6">
                        No members found.
                      </TableCell>
                    </TableRow>
                  );
                }
                return filteredList.map((member) => {
                  const payStatus = getPaymentStatus(member.renewalDate);
                  return (
                    <TableRow key={member._id}>
                      <TableCell className="font-semibold">{member.rollNo}</TableCell>
                      <TableCell>{member.fullName}</TableCell>
                      <TableCell>{member.surName || member.surname || "-"}</TableCell>
                      <TableCell>{member.memberType || "-"}</TableCell>
                      <TableCell>{member.cellNo}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={payStatus.className}>
                          {payStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(member.renewalDate)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link to={`/members/${member._id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Link to={`/members/edit/${member._id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="h-8 w-8 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-lg" onClick={() => handleDelete(member)} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title="Delete Member"
        message={`Are you sure you want to delete "${confirmState.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
