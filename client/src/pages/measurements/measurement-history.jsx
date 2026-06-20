import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, LineChart as ChartIcon, Search } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function MeasurementHistory() {
  const [memberId, setMemberId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      return res.data.data || [];
    },
    enabled: !!memberId
  });

  const filteredHistory = (history || []).filter((h) => {
    const d = new Date(h.createdAt || Date.now());
    if (startDate && d < new Date(startDate)) return false;
    if (endDate && d > new Date(endDate)) return false;
    return true;
  });

  const chartData = filteredHistory.map((h) => ({
    date: new Date(h.createdAt || Date.now()).toLocaleDateString(),
    weight: h.weightHistory?.[h.weightHistory.length - 1] || 0,
    bicep: h.bicepHistory?.[h.bicepHistory.length - 1] || 0,
    waist: h.waistHistory?.[h.waistHistory.length - 1] || 0
  })) || [];

  const list = filteredHistory;

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
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-stone-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-stone-200 p-4 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Weight Progression (kg)</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
          )}
        </>
      )}
    </div>
  );
}
