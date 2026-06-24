import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Eye, Trash2, ChevronLeft, ChevronRight, Search, Check, ChevronsUpDown, Dumbbell, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function RoutineView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [routineFilter, setRoutineFilter] = useState("all");
  const [memberStatusFilter, setMemberStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [openMemberSelect, setOpenMemberSelect] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, memberId: null, name: "" });
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["members-routines"],
    queryFn: async () => {
      const res = await API.get("/members");
      return res.data.data || [];
    }
  });

  const { data: routinesData, isLoading: loadingRoutines } = useQuery({
    queryKey: ["routines-all"],
    queryFn: async () => {
      const res = await API.get("/routines");
      return res.data.data || [];
    }
  });

  const combinedData = (routinesData?.map((rDoc) => {
    const memberRef = rDoc.memberId;
    if (!memberRef) return null;
    const member = typeof memberRef === "object" ? memberRef : members?.find((m) => m._id === memberRef);
    if (!member) return null;
    const hasExercise = rDoc.exerciseSchedule && rDoc.exerciseSchedule.length > 0;
    const hasMeal = rDoc.mealPlan && rDoc.mealPlan.length > 0;
    if (!hasExercise && !hasMeal) return null;
    return {
      member,
      hasExercise,
      hasMeal,
      exerciseSchedule: rDoc.exerciseSchedule || "",
      mealPlan: rDoc.mealPlan || "",
    };
  }).filter(Boolean)) || [];

  const filteredData = combinedData
    .filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = r.member?.fullName?.toLowerCase().includes(q);
        const matchRoll = r.member?.rollNo?.toLowerCase().includes(q);
        if (!matchName && !matchRoll) return false;
      }
      if (routineFilter === "both" && (!r.hasExercise || !r.hasMeal)) return false;
      if (routineFilter === "exercise" && !r.hasExercise) return false;
      if (routineFilter === "meal" && !r.hasMeal) return false;
      if (memberStatusFilter !== "all" && r.member?.status?.toLowerCase() !== memberStatusFilter) return false;
      return true;
    });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedList = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredData.length, totalPages, currentPage]);

  const deleteMutation = useMutation({
    mutationFn: async (memberId) => {
      const res = await API.delete(`/routines/${memberId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines-all"] });
      toast({ title: "Routine deleted" });
      setConfirmDelete({ open: false, memberId: null, name: "" });
    },
    onError: (err) => {
      toast({ title: "Delete failed", description: err.response?.data?.message || "Something went wrong.", variant: "destructive" });
    }
  });

  const handleAddRoutine = () => {
    if (!selectedMemberId) {
      toast({ title: "Please select a member", variant: "destructive" });
      return;
    }
    setAddDialogOpen(false);
    setSelectedMemberId("");
    navigate(`/routines/edit/${selectedMemberId}`);
  };

  const StatusBadge = ({ has }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${has ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-stone-100 text-stone-400 border-stone-200"}`}>
      {has ? "Set" : "Missing"}
    </span>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Workout & Nutrition Guidelines</h2>
        <Button onClick={() => setAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Routine</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-500" />
            <Input type="text" placeholder="Search member..." className="pl-9 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="sm:col-span-3">
          <Select value={routineFilter} onValueChange={setRoutineFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Routine" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routines</SelectItem>
              <SelectItem value="both">Both Set</SelectItem>
              <SelectItem value="exercise">Exercise Only</SelectItem>
              <SelectItem value="meal">Meal Plan Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Select value={memberStatusFilter} onValueChange={setMemberStatusFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 flex items-center text-sm text-stone-500 border border-stone-200 rounded-md bg-stone-50 px-3 justify-center">
          {filteredData.length} member(s)
        </div>
      </div>

      <div className="w-full mx-auto" style={{ maxWidth: "1055px" }}>
        {loadingRoutines || loadingMembers ? (
          <div className="flex flex-1 items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-stone-500" /></div>
        ) : (
          <Card className="border border-stone-200 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-stone-100">
              <CardTitle className="text-base font-semibold">Routine Records</CardTitle>
              <span className="text-xs text-stone-500">{filteredData.length} member(s)</span>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Meal Plan</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-stone-500">No routines found.</TableCell>
                    </TableRow>
                  ) : (
                    paginatedList.map((r) => (
                      <TableRow key={r.member._id}>
                        <TableCell className="font-medium text-stone-700">
                          {r.member.fullName} <span className="text-xs text-stone-400">({r.member.rollNo})</span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            r.member.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            r.member.status === "Expired" ? "bg-rose-50 text-rose-700 border-rose-200" :
                            "bg-stone-100 text-stone-500 border-stone-200"
                          }`}>
                            {r.member.status || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell><StatusBadge has={r.hasExercise} /></TableCell>
                        <TableCell><StatusBadge has={r.hasMeal} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center space-x-1.5">
                            <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors" onClick={() => setViewModal(r)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Link to={`/routines/edit/${r.member._id}`}>
                              <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors" onClick={() => setConfirmDelete({ open: true, memberId: r.member._id, name: r.member.fullName })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50 mt-auto">
                  <p className="text-xs text-stone-500">
                    Showing <span className="font-semibold text-stone-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-stone-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-stone-900">{filteredData.length}</span> members
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs font-medium text-stone-600 px-2">Page {currentPage} of {totalPages}</div>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="uppercase font-outfit text-stone-900">Add Routine</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Choose Member</Label>
              <Popover open={openMemberSelect} onOpenChange={setOpenMemberSelect}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openMemberSelect} className={`w-full justify-between font-normal h-9 text-sm ${!selectedMemberId ? "text-stone-500" : "text-stone-900"}`}>
                    {selectedMemberId && members?.length > 0
                      ? (() => {
                          const sel = members.find((m) => m._id === selectedMemberId);
                          return sel ? `${sel.fullName} (${sel.rollNo})` : "Select a member...";
                        })()
                      : "Select a member..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search member..." />
                    <CommandList>
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup>
                        {members?.map((m) => (
                          <CommandItem key={m._id} value={`${m.fullName} ${m.rollNo} ${m._id}`} onSelect={() => { setSelectedMemberId(m._id); setOpenMemberSelect(false); }}>
                            <Check className={`mr-2 h-4 w-4 ${selectedMemberId === m._id ? "opacity-100" : "opacity-0"}`} />
                            {m.fullName} ({m.rollNo})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setAddDialogOpen(false); setSelectedMemberId(""); }}>Cancel</Button>
              <Button onClick={handleAddRoutine} disabled={!selectedMemberId}>Continue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewModal} onOpenChange={(open) => { if (!open) setViewModal(null); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="uppercase font-outfit text-stone-900">
              Routine — {viewModal?.member?.fullName}
            </DialogTitle>
          </DialogHeader>
          {viewModal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Card className="border border-stone-200 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 border-b border-stone-100 py-3">
                  <Dumbbell className="h-4 w-4 text-stone-700" />
                  <CardTitle className="text-sm font-semibold">Workout Splits</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 text-sm text-stone-700 whitespace-pre-line">
                  {viewModal.hasExercise ? viewModal.exerciseSchedule : <span className="text-stone-400 italic">Not set</span>}
                </CardContent>
              </Card>
              <Card className="border border-stone-200 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 border-b border-stone-100 py-3">
                  <Clipboard className="h-4 w-4 text-stone-700" />
                  <CardTitle className="text-sm font-semibold">Meal & Diet Plan</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 text-sm text-stone-700 whitespace-pre-line">
                  {viewModal.hasMeal ? viewModal.mealPlan : <span className="text-stone-400 italic">Not set</span>}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={confirmDelete.open}
        title="Delete Routine"
        message={`Are you sure you want to delete the routine for ${confirmDelete.name}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={() => deleteMutation.mutate(confirmDelete.memberId)}
        onCancel={() => setConfirmDelete({ open: false, memberId: null, name: "" })}
      />
    </div>
  );
}
