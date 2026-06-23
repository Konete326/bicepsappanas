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
import { Loader2, Plus } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";

export default function MeasurementHistory() {
  const [memberId, setMemberId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      // Transform single document with nested arrays into array of entries
      const entries = (m.weightHistory || []).map((w, i) => ({
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
      return entries;
    },
    enabled: !!memberId
  });

  // Pre-fill form with latest measurement entry
  useEffect(() => {
    if (history && history.length > 0) {
      const latest = history[history.length - 1];
      setAge(latest.age || "");
      setHeight(latest.heightFeetInches || "");
      setWeight(latest.weight || "");
      setBicep(latest.bicep || "");
      setChest(latest.chest || "");
      setWaist(latest.waist || "");
      setLegs(latest.leg || "");
    }
  }, [history]);

  const filteredHistory = (history || []).filter((h) => {
    const d = new Date(h.createdAt || Date.now());
    if (startDate && d < new Date(startDate)) return false;
    if (endDate && d > new Date(endDate)) return false;
    return true;
  });

  const chartData = filteredHistory.map((h) => ({
    date: new Date(h.createdAt || Date.now()).toLocaleDateString(),
    weight: h.weight || 0,
    bicep: h.bicep || 0,
    waist: h.waist || 0
  }));

  const list = filteredHistory;

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/measurements", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements-history"] });
      toast({ title: "Measurements updated successfully" });
      resetForm();
    },
    onError: (err) => {
      toast({ title: "Update failed", description: err.response?.data?.message || "Invalid values.", variant: "destructive" });
    }
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!memberId) return;
    mutation.mutate({
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
          {list.length} record(s)
        </div>
      </div>

      {memberId && (
        <>
          {loadingHistory ? (
            <div className="flex flex-1 items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-stone-500" /></div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              {/* Left Side — Update Form */}
              <div className="w-full lg:w-[320px] shrink-0 border border-stone-200 rounded-xl p-4 bg-white shadow-sm">
                <h3 className="text-sm font-bold text-stone-900 font-outfit uppercase border-b border-stone-100 pb-2 mb-3">Update Stats</h3>
                <form onSubmit={handleUpdate} className="space-y-2.5 text-[11px]">
                  <div><Label htmlFor="u-age">Age</Label><Input id="u-age" type="number" placeholder="e.g. 18" value={age} onChange={(e) => setAge(e.target.value)} required /></div>
                  <div><Label htmlFor="u-height">Height (Ft.In)</Label><Input id="u-height" placeholder="e.g. 5.7" value={height} onChange={(e) => setHeight(e.target.value)} required /></div>
                  <div><Label htmlFor="u-weight">Weight (kg)</Label><Input id="u-weight" type="number" step="0.1" placeholder="e.g. 70.5" value={weight} onChange={(e) => setWeight(e.target.value)} required /></div>
                  <div><Label htmlFor="u-bicep">Bicep (in)</Label><Input id="u-bicep" type="number" step="0.1" placeholder="e.g. 14.5" value={bicep} onChange={(e) => setBicep(e.target.value)} /></div>
                  <div><Label htmlFor="u-chest">Chest (in)</Label><Input id="u-chest" type="number" step="0.1" placeholder="e.g. 40" value={chest} onChange={(e) => setChest(e.target.value)} /></div>
                  <div><Label htmlFor="u-waist">Waist (in)</Label><Input id="u-waist" type="number" step="0.1" placeholder="e.g. 32" value={waist} onChange={(e) => setWaist(e.target.value)} /></div>
                  <div><Label htmlFor="u-legs">Legs (in)</Label><Input id="u-legs" type="number" step="0.1" placeholder="e.g. 22" value={legs} onChange={(e) => setLegs(e.target.value)} /></div>
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="animate-spin mr-2 h-3 w-3" /> : <Plus className="mr-2 h-3 w-3" />}
                    Log New Entry
                  </Button>
                </form>
              </div>

              {/* Right Side — Charts & History */}
              <div className="flex-1 space-y-6">
              <Card className="border border-stone-200 p-4 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Weight Progression (kg)</CardTitle></CardHeader>
                <CardContent className="h-64">
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
                <CardContent className="h-64">
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

              <Card className="border border-stone-200 shadow-sm md:col-span-2">
                <CardHeader><CardTitle className="text-base font-semibold">Logs Table</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Height</TableHead>
                        <TableHead>BMI Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        if (list.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4">No records found.</TableCell>
                            </TableRow>
                          );
                        }
                        return list.map((h) => (
                          <TableRow key={h._id}>
                            <TableCell>{new Date(h.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                            <TableCell>{h.age}</TableCell>
                            <TableCell>{h.heightFeetInches}</TableCell>
                            <TableCell>{h.bmiCategory || "Normal"}</TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
