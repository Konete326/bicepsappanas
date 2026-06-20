import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Plus } from "lucide-react";

export default function LedgerView() {
  const { id } = useParams();
  const [sessions, setSessions] = useState(0);

  const { data: trainer, isLoading: loadingTrainer } = useQuery({
    queryKey: ["trainer", id],
    queryFn: async () => {
      const res = await API.get(`/trainers/${id}`);
      return res.data.data;
    }
  });

  const { data: ledger, isLoading: loadingLedger } = useQuery({
    queryKey: ["ledger", id],
    queryFn: async () => {
      const res = await API.get(`/trainers/ledger/${id}`);
      return res.data.data || [];
    }
  });

  if (loadingTrainer || loadingLedger) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  const basePay = trainer?.baseSalary || 0;
  const rate = trainer?.commissionRate || 0;
  const advanceDebit = ledger?.filter((l) => l.transactionType === "Debit").reduce((sum, item) => sum + item.amount, 0) || 0;
  const advanceCredit = ledger?.filter((l) => l.transactionType === "Credit").reduce((sum, item) => sum + item.amount, 0) || 0;
  const advanceBalance = Math.max(0, advanceDebit - advanceCredit);
  const netSalary = basePay + (sessions * rate) - advanceBalance;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/trainers">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Trainer Payout & Ledger</h2>
        </div>
        <Link to={`/trainers/${id}/ledger/new`}>
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Log Transaction</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-stone-200 shadow-sm md:col-span-1 p-6 space-y-4">
          <h3 className="text-lg font-bold font-outfit text-stone-900 uppercase">Payout Calculator</h3>
          <div>
            <Label htmlFor="sessions">Sessions Completed this Month</Label>
            <Input id="sessions" type="number" min={0} value={sessions} onChange={(e) => setSessions(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
            <div className="flex justify-between"><span>Base Salary:</span><strong>PKR {basePay}</strong></div>
            <div className="flex justify-between"><span>Commission:</span><strong>PKR {sessions * rate}</strong></div>
            <div className="flex justify-between text-red-600"><span>Advance Balance:</span><strong>PKR {advanceBalance}</strong></div>
            <div className="flex justify-between text-base font-bold border-t border-stone-200 pt-2 text-stone-900">
              <span>Calculated Net Salary:</span><span>PKR {netSalary}</span>
            </div>
          </div>
        </Card>

        <Card className="border border-stone-200 shadow-sm md:col-span-2">
          <CardHeader><CardTitle className="text-lg font-semibold">Ledger History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-stone-500 py-6">No ledger entries found.</TableCell>
                  </TableRow>
                ) : (
                  ledger?.map((l) => (
                    <TableRow key={l._id}>
                      <TableCell>{new Date(l.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell className={l.transactionType === "Debit" ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                        {l.transactionType}
                      </TableCell>
                      <TableCell>PKR {l.amount}</TableCell>
                      <TableCell className="text-stone-600 text-xs">{l.referenceNote || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
