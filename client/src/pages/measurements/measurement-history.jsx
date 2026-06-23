import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MeasurementHistory() {
  const [memberId, setMemberId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Modals state
  const [viewModalData, setViewModalData] = useState(null); // null or entry data
  const [updateModalData, setUpdateModalData] = useState(null); // null or { index, entry }
  const [confirmDeleteState, setConfirmDeleteState] = useState({ open: false, index: null, dateStr: "" });

  // Update Form State
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bicep, setBicep] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [legs, setLegs] = useState("");

  const resetForm = () => { setAge(""); setHeight(""); setWeight(""); setBicep(""); setChest(""); setWaist(""); setLegs(""); };

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["members-lookup-history"],
    queryFn: async () => {
      const res = await API.get("/members");
      return res.data.data || [];
    }
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["measurements-history", memberId],
    queryFn: async () => {
      const res = await API.get(`/measurements/${memberId}`);
      const m = res.data.data;
      if (!m) return [];
      
      const entries = (m.weightHistory || []).map((w, i) => ({
        originalIndex: i,
        _id: `${m._id}-${i}`,
        createdAt: w.date,
        age: m.age,
        heightFeetInches: m.heightFeetInches,
        bmiCategory: m.bmiCategory || "Normal",
        weight: w.value,
        bicep: m.bicepHistory?.[i]?.value || 0,
        waist: m.waistHistory?.[i]?.value || 0,
        shoulder: m.shoulderHistory?.[i]?.value || 0,
        chest: m.chestHistory?.[i]?.value || 0,
        calf: m.calfHistory?.[i]?.value || 0,
        leg: m.legHistory?.[i]?.value || 0,
      }));
      // Sort by date descending for the list
      return entries.reverse();
    },
    enabled: !!memberId
  });

  const filteredHistory = (history || []).filter((h) => {
    const d = new Date(h.createdAt || Date.now());
    if (startDate && d < new Date(startDate)) return false;
    if (endDate && d > new Date(endDate)) return false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
  const paginatedList = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Ensure current page is valid when filters change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredHistory.length, totalPages, currentPage]);

  const chartData = [...filteredHistory].reverse().map((h) => ({
    date: new Date(h.createdAt || Date.now()).toLocaleDateString(),
    weight: h.weight || 0,
    bicep: h.bicep || 0,
    waist: h.waist || 0
  }));

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/measurements", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements-history"] });
      toast({ title: "Measurements logged successfully" });
      resetForm();
    },
    onError: (err) => {
      toast({ title: "Failed", description: err.response?.data?.message || "Invalid values.", variant: "destructive" });
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.put(`/measurements/${memberId}/entries/${payload.index}`, payload.data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements-history"] });
      toast({ title: "Measurement entry updated" });
      setUpdateModalData(null);
    },
    onError: (err) => {
      toast({ title: "Update failed", description: err.response?.data?.message || "Invalid values.", variant: "destructive" });
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (index) => {
      const res = await API.delete(`/measurements/${memberId}/entries/${index}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements-history"] });
      toast({ title: "Measurement entry deleted" });
      setConfirmDeleteState({ open: false, index: null, dateStr: "" });
    },
    onError: (err) => {
      toast({ title: "Delete failed", description: err.response?.data?.message || "Something went wrong.", variant: "destructive" });
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!memberId) return;
    createMutation.mutate({
      memberId,
      age: parseInt(age) || 0,
      heightFeetInches: height,
      weight: parseFloat(weight) || 0,
      bicep: parseFloat(bicep) || 0,
      chest: parseFloat(chest) || 0,
      waist: parseFloat(waist) || 0,
      leg: parseFloat(legs) || 0,
    });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!memberId || !updateModalData) return;
    updateMutation.mutate({
      index: updateModalData.index,
      data: {
        age: parseInt(age) || 0,
        heightFeetInches: height,
        weight: parseFloat(weight) || 0,
        bicep: parseFloat(bicep) || 0,
        chest: parseFloat(chest) || 0,
        waist: parseFloat(waist) || 0,
        leg: parseFloat(legs) || 0,
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
    setUpdateModalData({ index: entry.originalIndex, entry });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Progress Charts & Tracking</h2>
        <Link to="/measurements/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Log Stats</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="relative sm:col-span-5">
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger><SelectValue placeholder="Choose member to track" /></SelectTrigger>
            <SelectContent>
              {members?.length > 0 ? (
                members.map((m) => <SelectItem key={m._id} value={m._id}>{m.fullName} ({m.rollNo})</SelectItem>)
              ) : (
                <SelectItem value="__none__" disabled>No members found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-3">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="From" />
        </div>
        <div className="sm:col-span-2">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="To" />
        </div>
        <div className="sm:col-span-2 flex items-center text-sm text-stone-500 border border-stone-200 rounded-md bg-stone-50 px-3 justify-center">
          {filteredHistory.length} record(s)
        </div>
      </div>

      {memberId && (
        <>
          {loadingHistory ? (
            <div className="flex flex-1 items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-stone-500" /></div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              
              {/* Left Side — Create Form */}
              <div className="w-full lg:w-[320px] shrink-0 border border-stone-200 rounded-xl p-4 bg-white shadow-sm">
                <h3 className="text-sm font-bold text-stone-900 font-outfit uppercase border-b border-stone-100 pb-2 mb-3">Add New Stats</h3>
                <form onSubmit={handleCreate} className="space-y-2.5 text-[11px]">
                  <div><Label htmlFor="c-age">Age</Label><Input id="c-age" type="number" placeholder="e.g. 18" value={age} onChange={(e) => setAge(e.target.value)} required /></div>
                  <div><Label htmlFor="c-height">Height (Ft.In)</Label><Input id="c-height" placeholder="e.g. 5.7" value={height} onChange={(e) => setHeight(e.target.value)} required /></div>
                  <div><Label htmlFor="c-weight">Weight (kg)</Label><Input id="c-weight" type="number" step="0.1" placeholder="e.g. 70.5" value={weight} onChange={(e) => setWeight(e.target.value)} required /></div>
                  <div><Label htmlFor="c-bicep">Bicep (in)</Label><Input id="c-bicep" type="number" step="0.1" placeholder="e.g. 14.5" value={bicep} onChange={(e) => setBicep(e.target.value)} /></div>
                  <div><Label htmlFor="c-chest">Chest (in)</Label><Input id="c-chest" type="number" step="0.1" placeholder="e.g. 40" value={chest} onChange={(e) => setChest(e.target.value)} /></div>
                  <div><Label htmlFor="c-waist">Waist (in)</Label><Input id="c-waist" type="number" step="0.1" placeholder="e.g. 32" value={waist} onChange={(e) => setWaist(e.target.value)} /></div>
                  <div><Label htmlFor="c-legs">Legs (in)</Label><Input id="c-legs" type="number" step="0.1" placeholder="e.g. 22" value={legs} onChange={(e) => setLegs(e.target.value)} /></div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="animate-spin mr-2 h-3 w-3" /> : <Plus className="mr-2 h-3 w-3" />}
                    Log New Entry
                  </Button>
                </form>
              </div>

              {/* Right Side — Charts & History */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-stone-200 p-4 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Weight Progression (kg)</CardTitle></CardHeader>
                    <CardContent className="h-48">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="weight" stroke="#18181b" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border border-stone-200 p-4 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Muscle Dynamics (inches)</CardTitle></CardHeader>
                    <CardContent className="h-48">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="bicep" stroke="#2563eb" strokeWidth={2} name="Bicep" />
                          <Line type="monotone" dataKey="waist" stroke="#dc2626" strokeWidth={2} name="Waist" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border border-stone-200 shadow-sm flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-stone-100">
                    <CardTitle className="text-base font-semibold">Measurement Logs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>BMI Category</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-stone-500">No records found.</TableCell>
                          </TableRow>
                        ) : (
                          paginatedList.map((h) => (
                            <TableRow key={h._id}>
                              <TableCell className="font-semibold text-stone-800">
                                {new Date(h.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                              </TableCell>
                              <TableCell>{h.weight} kg</TableCell>
                              <TableCell>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  h.bmiCategory === 'Normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  h.bmiCategory === 'Underweight' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {h.bmiCategory || "Normal"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right space-x-1.5">
                                <Button size="icon" variant="outline" className="h-7 w-7 text-stone-500" onClick={() => setViewModalData(h)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="outline" className="h-7 w-7 text-stone-500" onClick={() => openUpdateModal(h)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="outline" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDeleteState({ open: true, index: h.originalIndex, dateStr: new Date(h.createdAt).toLocaleDateString() })}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
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
                          Showing <span className="font-semibold text-stone-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-stone-900">{Math.min(currentPage * itemsPerPage, filteredHistory.length)}</span> of <span className="font-semibold text-stone-900">{filteredHistory.length}</span> entries
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
        </>
      )}

      {/* View Modal */}
      <Dialog open={!!viewModalData} onOpenChange={(open) => !open && setViewModalData(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="uppercase font-outfit text-stone-900">Measurement Details</DialogTitle>
          </DialogHeader>
          {viewModalData && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm border-b border-stone-100 pb-4">
                <div><span className="text-stone-500 text-xs uppercase font-bold tracking-wider block">Date</span><span className="font-semibold">{new Date(viewModalData.createdAt).toLocaleDateString()}</span></div>
                <div><span className="text-stone-500 text-xs uppercase font-bold tracking-wider block">BMI Category</span><span className="font-semibold text-stone-900">{viewModalData.bmiCategory}</span></div>
                <div><span className="text-stone-500 text-xs uppercase font-bold tracking-wider block">Age</span><span className="font-semibold">{viewModalData.age}</span></div>
                <div><span className="text-stone-500 text-xs uppercase font-bold tracking-wider block">Height</span><span className="font-semibold">{viewModalData.heightFeetInches}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="flex justify-between items-center"><span className="text-stone-600">Weight</span><span className="font-bold">{viewModalData.weight} kg</span></div>
                <div className="flex justify-between items-center"><span className="text-stone-600">Bicep</span><span className="font-bold">{viewModalData.bicep} in</span></div>
                <div className="flex justify-between items-center"><span className="text-stone-600">Chest</span><span className="font-bold">{viewModalData.chest} in</span></div>
                <div className="flex justify-between items-center"><span className="text-stone-600">Waist</span><span className="font-bold">{viewModalData.waist} in</span></div>
                <div className="flex justify-between items-center"><span className="text-stone-600">Shoulder</span><span className="font-bold">{viewModalData.shoulder} in</span></div>
                <div className="flex justify-between items-center"><span className="text-stone-600">Calf</span><span className="font-bold">{viewModalData.calf} in</span></div>
                <div className="flex justify-between items-center"><span className="text-stone-600">Legs</span><span className="font-bold">{viewModalData.leg} in</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Modal */}
      <Dialog open={!!updateModalData} onOpenChange={(open) => {
        if (!open) {
          setUpdateModalData(null);
          resetForm(); // Clear the form when closing update modal
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="uppercase font-outfit text-stone-900">Update Measurement</DialogTitle>
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
                <div className="col-span-2"><Label htmlFor="e-legs">Legs (in)</Label><Input id="e-legs" type="number" step="0.1" value={legs} onChange={(e) => setLegs(e.target.value)} /></div>
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
        onConfirm={() => deleteMutation.mutate(confirmDeleteState.index)}
        onCancel={() => setConfirmDeleteState({ open: false, index: null, dateStr: "" })}
      />
    </div>
  );
}
