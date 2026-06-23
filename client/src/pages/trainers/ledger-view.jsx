import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LedgerView() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: async (entryId) => {
      await API.delete(`/trainers/ledger/${entryId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Ledger entry deleted successfully." });
      queryClient.invalidateQueries(["ledger", id]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete entry.",
        variant: "destructive"
      });
    }
  });

  const { data: ledgerData, isLoading: loadingLedger } = useQuery({
    queryKey: ["ledger", id],
    queryFn: async () => {
      const res = await API.get(`/trainers/ledger/${id}`);
      return res.data.data;
    },
    staleTime: 0,
    refetchOnMount: "always"
  });

  if (loadingLedger) {
    return (
      <div className="flex flex-1 items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  const trainer = ledgerData?.trainer || {};

  const basePay = trainer?.baseSalary || 0;
  const validLedger = Array.isArray(ledgerData?.entries) ? ledgerData.entries : (Array.isArray(ledgerData) ? ledgerData : []);
  const summary = ledgerData?.summary || {};

  const totalSalary = summary.totalSalary || 0;
  const totalAdvance = summary.totalAdvance || 0;
  const totalCommission = summary.totalCommission || 0;
  const totalDeductions = summary.totalDeductions || 0;
  const advanceBalance = summary.currentAdvance || 0;
  const netSalary = summary.netSalary ?? basePay;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/trainers">
            <Button size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Trainer Payments</h2>
        </div>
        <Link to={`/trainers/${id}/ledger/new`}>
          <Button size="sm" className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Add Payment</Button>
        </Link>
      </div>

      <Card className="border border-stone-200 shadow-sm py-2 px-4 mb-4 bg-stone-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h3 className="text-xs font-bold font-outfit text-stone-900 uppercase tracking-wider">Trainer Details</h3>
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Name</p>
              <p className="text-xs font-semibold text-stone-900">{trainer?.fullName || "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Phone</p>
              <p className="text-xs font-semibold text-stone-900">{trainer?.phone || "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Gender</p>
              <p className="text-xs font-semibold text-stone-900">{trainer?.gender || "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Joined</p>
              <p className="text-xs font-semibold text-stone-900">
                {trainer?.joiningDate ? new Date(trainer.joiningDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-stone-200 shadow-sm md:col-span-1 p-6 space-y-4">
          <h3 className="text-lg font-bold font-outfit text-stone-900 uppercase">Ledger Summary</h3>
          <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
            <div className="flex justify-between text-stone-500"><span>Base Salary:</span><strong className="text-stone-900">PKR {basePay}</strong></div>
            <div className="flex justify-between text-stone-500"><span>Total Salary Paid:</span><strong className="text-green-600">PKR {totalSalary}</strong></div>
            <div className="flex justify-between text-stone-500"><span>Total Commissions:</span><strong className="text-green-600">PKR {totalCommission}</strong></div>
            <div className="flex justify-between text-stone-500"><span>Total Advances:</span><strong className="text-stone-900">PKR {totalAdvance}</strong></div>
            <div className="flex justify-between text-stone-500"><span>Total Deductions/Fines:</span><strong className="text-red-600">PKR {totalDeductions}</strong></div>
            <div className="flex justify-between text-red-600 border-t border-stone-100 pt-2"><span>Current Advance Bal:</span><strong>PKR {advanceBalance}</strong></div>
            <div className="flex justify-between text-base font-bold border-t border-stone-200 pt-2 text-stone-900">
              <span>Calculated Net Salary:</span><span>PKR {netSalary}</span>
            </div>
          </div>
        </Card>

        <Card className="border border-stone-200 shadow-sm md:col-span-2">
          <CardHeader><CardTitle className="text-lg font-semibold">Ledger History</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference Note</TableHead>
                  <TableHead className="w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validLedger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-stone-500 py-6">No ledger entries found.</TableCell>
                  </TableRow>
                ) : (
                  validLedger.map((l) => (
                    <TableRow key={l._id}>
                      <TableCell className="whitespace-nowrap text-stone-600 text-xs">
                        {new Date(l.createdAt || Date.now()).toLocaleString("en-PK", {
                          timeZone: "Asia/Karachi",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </TableCell>
                      <TableCell>
                        <div className={`font-semibold capitalize ${(l.transactionType === "advance" || l.transactionType === "deduction") ? "text-red-600" : "text-green-600"}`}>
                          {l.transactionType}
                        </div>
                        {l.salaryMonth && (
                          <div className="text-xs text-stone-500 font-medium mt-0.5">
                            {l.salaryMonth}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>PKR {l.amount}</TableCell>
                      <TableCell className="text-stone-600 text-xs">{l.referenceNote || "N/A"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={() => setDeleteTarget(l._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected ledger entry and recalculate your overall ledger balance to maintain accurate totals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTarget)}
            >
              {deleteMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Delete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
