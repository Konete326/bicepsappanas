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
import { Loader2, Plus, Edit, Eye, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MeasurementHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bmiFilter, setBmiFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Modals state
  const [updateModalData, setUpdateModalData] = useState(null); // null or { memberId, index, entry }
  const [confirmDeleteState, setConfirmDeleteState] = useState({ open: false, memberId: null, index: null, dateStr: "" });

  // Update Form State
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bicep, setBicep] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [legs, setLegs] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [calf, setCalf] = useState("");

  const resetForm = () => { setAge(""); setHeight(""); setWeight(""); setBicep(""); setChest(""); setWaist(""); setLegs(""); setShoulder(""); setCalf(""); };

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["members-lookup-history"],
    queryFn: async () => {
      const res = await API.get("/members");
      return res.data.data || [];
    }
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ["measurements-all"],
    queryFn: async () => {
      const res = await API.get("/measurements");
      return res.data.data || [];
    }
  });

  // Only show members who have measurement data logged
  const combinedData = (historyData?.map((mDoc) => {
    const memberRef = mDoc.memberId;
    if (!memberRef) return null;
    const member = typeof memberRef === 'object' ? memberRef : members?.find(m => m._id === memberRef);
    if (!member) return null;
    if (!mDoc.weightHistory?.length) return null;

    const latestIdx = mDoc.weightHistory.length - 1;
    const latest = mDoc.weightHistory[latestIdx];
    return {
      member,
      hasData: true,
      _id: `${member._id}-latest`,
      originalIndex: latestIdx,
      createdAt: latest.date,
      age: mDoc.age,
      heightFeetInches: mDoc.heightFeetInches,
      bmiCategory: mDoc.bmiCategory || "Normal",
      weight: latest.value,
      bicep: mDoc.bicepHistory?.[latestIdx]?.value || 0,
      chest: mDoc.chestHistory?.[latestIdx]?.value || 0,
      waist: mDoc.waistHistory?.[latestIdx]?.value || 0,
      shoulder: mDoc.shoulderHistory?.[latestIdx]?.value || 0,
      calf: mDoc.calfHistory?.[latestIdx]?.value || 0,
      leg: mDoc.legHistory?.[latestIdx]?.value || 0,
    };
  }).filter(Boolean)) || [];

  const filteredData = combinedData.filter((h) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = h.member?.fullName?.toLowerCase().includes(query);
      const matchRoll = h.member?.rollNo?.toLowerCase().includes(query);
      if (!matchName && !matchRoll) return false;
    }
    if (bmiFilter !== "all") {
      if (h.bmiCategory?.toLowerCase() !== bmiFilter.toLowerCase()) return false;
    }
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedList = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredData.length, totalPages, currentPage]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.put(`/measurements/${payload.memberId}/entries/${payload.index}`, payload.data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements-all"] });
      toast({ title: "Measurement entry updated" });
      setUpdateModalData(null);
    },
    onError: (err) => {
      toast({ title: "Update failed", description: err.response?.data?.message || "Invalid values.", variant: "destructive" });
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ memberId, index }) => {
      const res = await API.delete(`/measurements/${memberId}/entries/${index}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements-all"] });
      toast({ title: "Measurement entry deleted" });
      setConfirmDeleteState({ open: false, memberId: null, index: null, dateStr: "" });
    },
    onError: (err) => {
      toast({ title: "Delete failed", description: err.response?.data?.message || "Something went wrong.", variant: "destructive" });
    }
  });

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!updateModalData) return;
    updateMutation.mutate({
      memberId: updateModalData.memberId,
      index: updateModalData.index,
      data: {
        age: parseInt(age) || 0,
        heightFeetInches: height,
        weight: parseFloat(weight) || 0,
        bicep: parseFloat(bicep) || 0,
        chest: parseFloat(chest) || 0,
        waist: parseFloat(waist) || 0,
        leg: parseFloat(legs) || 0,
        shoulder: parseFloat(shoulder) || 0,
        calf: parseFloat(calf) || 0,
      }
    });
  };

  const openUpdateModal = (entry) => {
    setAge(entry.age || "");
    setHeight(entry.heightFeetInches || "");
    setWeight(entry.weight || "");
    setBicep(entry.bicep || "");
    setChest(entry.chest || "");
    setWaist(entry.waist || "");
    setLegs(entry.leg || "");
    setShoulder(entry.shoulder || "");
    setCalf(entry.calf || "");
    setUpdateModalData({ memberId: entry.member._id, index: entry.originalIndex, entry });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Progress Charts & Tracking</h2>
        <Link to="/measurements/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Measurement</Button>
        </Link>
      </div>

      <div className="w-full flex space-x-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-500" />
          <Input 
            type="text" 
            placeholder="Search member..." 
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="measured">Has Data</SelectItem>
              <SelectItem value="missing">Missing Data</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={bmiFilter} onValueChange={setBmiFilter}>
            <SelectTrigger className="w-full"><SelectValue placeholder="BMI Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="underweight">Underweight</SelectItem>
              <SelectItem value="overweight">Overweight</SelectItem>
              <SelectItem value="obesity">Obesity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center text-sm text-stone-500 border border-stone-200 rounded-md bg-stone-50 px-3 h-10 whitespace-nowrap">
          {filteredData.length} member(s)
        </div>
      </div>

      <div className="w-full mx-auto" style={{ maxWidth: '1055px' }}>
        {loadingHistory || loadingMembers ? (
            <div className="flex flex-1 items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-stone-500" /></div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              {/* Right Side — History */}
              <div className="flex-1 space-y-6">
                <Card className="border border-stone-200 shadow-sm flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-stone-100">
                    <CardTitle className="text-base font-semibold">Measurement Logs (Latest)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Latest Date</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>BMI Category</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-stone-500">No members found.</TableCell>
                          </TableRow>
                        ) : (
                          paginatedList.map((h) => (
                            <TableRow key={h._id}>
                                <TableCell className="font-medium text-stone-700">
                                  {h.member.fullName} <span className="text-xs text-stone-400">({h.member.rollNo})</span>
                                </TableCell>
                                <TableCell className="text-stone-800">
                                  {h.hasData ? new Date(h.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : <span className="text-stone-400 italic">No Data</span>}
                                </TableCell>
                                <TableCell>{h.hasData ? `${h.weight} kg` : "-"}</TableCell>
                              <TableCell>
                                {h.hasData ? (
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    h.bmiCategory === 'Normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    h.bmiCategory === 'Underweight' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {h.bmiCategory}
                                  </span>
                                ) : (
                                  <span className="text-stone-400 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end items-center space-x-1.5">
                                  <Link to={`/measurements/${h.member._id}`}>
                                    <Button size="icon" variant="outline" className="h-7 w-7 rounded-full text-stone-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                  <Button size="icon" variant="outline" className="h-7 w-7 rounded-full text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors" onClick={() => openUpdateModal(h)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="outline" className="h-7 w-7 rounded-full text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors" onClick={() => setConfirmDeleteState({ open: true, memberId: h.member._id, index: h.originalIndex, dateStr: new Date(h.createdAt).toLocaleDateString() })}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50 mt-auto">
                        <p className="text-xs text-stone-500">
                          Showing <span className="font-semibold text-stone-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-stone-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-stone-900">{filteredData.length}</span> members
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="text-xs font-medium text-stone-600 px-2">
                            Page {currentPage} of {totalPages}
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
      </div>

      {/* Update Modal */}
      <Dialog open={!!updateModalData} onOpenChange={(open) => {
        if (!open) {
          setUpdateModalData(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="uppercase font-outfit text-stone-900">Update Measurement - {updateModalData?.entry?.member?.fullName}</DialogTitle>
          </DialogHeader>
          {updateModalData && (
            <form onSubmit={handleUpdateSubmit} className="space-y-3 pt-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="e-age">Age</Label><Input id="e-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required /></div>
                <div><Label htmlFor="e-height">Height (Ft.In)</Label><Input id="e-height" value={height} onChange={(e) => setHeight(e.target.value)} required /></div>
                <div><Label htmlFor="e-weight">Weight (kg)</Label><Input id="e-weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required /></div>
                <div><Label htmlFor="e-bicep">Bicep (in)</Label><Input id="e-bicep" type="number" step="0.1" value={bicep} onChange={(e) => setBicep(e.target.value)} /></div>
                <div><Label htmlFor="e-chest">Chest (in)</Label><Input id="e-chest" type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} /></div>
                <div><Label htmlFor="e-waist">Waist (in)</Label><Input id="e-waist" type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} /></div>
                <div><Label htmlFor="e-legs">Legs (in)</Label><Input id="e-legs" type="number" step="0.1" value={legs} onChange={(e) => setLegs(e.target.value)} /></div>
                <div><Label htmlFor="e-shoulder">Shoulder (in)</Label><Input id="e-shoulder" type="number" step="0.1" value={shoulder} onChange={(e) => setShoulder(e.target.value)} /></div>
                <div className="col-span-2"><Label htmlFor="e-calf">Calves (in)</Label><Input id="e-calf" type="number" step="0.1" value={calf} onChange={(e) => setCalf(e.target.value)} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setUpdateModalData(null); resetForm(); }}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="animate-spin h-3 w-3 mr-2" />} Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={confirmDeleteState.open}
        title="Delete Measurement"
        message={`Are you sure you want to delete the measurement entry for ${confirmDeleteState.dateStr}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={() => deleteMutation.mutate({ memberId: confirmDeleteState.memberId, index: confirmDeleteState.index })}
        onCancel={() => setConfirmDeleteState({ open: false, memberId: null, index: null, dateStr: "" })}
      />
    </div>
  );
}
