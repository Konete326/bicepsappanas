import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Eye, AlertCircle } from "lucide-react";

export default function PaymentList() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await API.get("/payments");
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

      {isLoading ? (
        <div className="flex justify-center p-8">
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
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
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
