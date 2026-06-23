import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, AlertCircle, Search, Printer } from "lucide-react";

export default function PaymentList() {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", method, startDate, endDate, search],
    queryFn: async () => {
      const params = {};
      if (method !== "all") params.method = method;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;
      const res = await API.get("/payments", { params });
      return res.data.data || [];
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Payments & Receipts Log</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link to="/payments/dues" className="flex-1 sm:flex-initial">
            <Button className="w-full">
              <AlertCircle className="mr-2 h-4 w-4" /> Dues Report
            </Button>
          </Link>
          <Link to="/payments/new" className="flex-1 sm:flex-initial">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="relative sm:col-span-5">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <Input placeholder="Search by member name or roll no..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="sm:col-span-3">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Easy Paisa">Easy Paisa</SelectItem>
              <SelectItem value="Jazz Cash">Jazz Cash</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
              <SelectItem value="UPI/Online">UPI / Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt S.No</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const list = payments || [];
                if (list.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-stone-500 py-6">
                        No receipts recorded yet.
                      </TableCell>
                    </TableRow>
                  );
                }
                return list.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-semibold">S.No - {String(p.serialNo).padStart(3, "0")}</TableCell>
                    <TableCell>
                      <div className="font-medium text-stone-900">{p.memberId?.fullName || "Deleted Member"}</div>
                      <div className="text-xs text-stone-500">{p.memberId?.rollNo || ""}</div>
                    </TableCell>
                    <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell>{p.paymentMethod}</TableCell>
                    <TableCell className="font-bold text-stone-850">PKR {p.amountReceived}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/payments/receipt/${p._id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
