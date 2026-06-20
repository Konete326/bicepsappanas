import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, CreditCard } from "lucide-react";

export default function DuesReport() {
  const { data: members, isLoading } = useQuery({
    queryKey: ["members-dues"],
    queryFn: async () => {
      const res = await API.get("/members");
      return res.data.data || [];
    }
  });

  const unpaidMembers = members?.filter((m) => {
    const fee = m.monthlyFee || 0;
    return fee > 0;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/payments">
          <Button size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Outstanding Dues Report</h2>
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
                <TableHead>Roll No</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaidMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-stone-500 py-6">
                    All memberships are fully settled.
                  </TableCell>
                </TableRow>
              ) : (
                unpaidMembers.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell className="font-semibold">{m.rollNo}</TableCell>
                    <TableCell>{m.fullName}</TableCell>
                    <TableCell className="font-semibold text-stone-700">PKR {m.monthlyFee || 0}</TableCell>
                    <TableCell>{new Date(m.renewalDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/payments/new?memberId=${m._id}`}>
                        <Button size="sm" className="h-8">
                          <CreditCard className="mr-2 h-4 w-4" /> Pay Dues
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
