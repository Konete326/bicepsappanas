import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, DollarSign, Users, UserCheck } from "lucide-react";

export default function Reports() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ["dashboard-data-reports"],
    queryFn: async () => {
      const res = await API.get("/dashboard");
      return res.data.data || {};
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  const stats = dashData?.stats || {};

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Gym Financial Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-stone-200 shadow-sm p-6 space-y-2">
          <div className="flex items-center gap-2 text-stone-500"><DollarSign className="h-5 w-5" /><span>Total Revenue Collection</span></div>
          <p className="text-2xl font-bold text-stone-900 font-outfit">PKR {stats.todayRevenue || 0}</p>
        </Card>
        <Card className="border border-stone-200 shadow-sm p-6 space-y-2">
          <div className="flex items-center gap-2 text-stone-500"><Users className="h-5 w-5" /><span>Active Subscription Base</span></div>
          <p className="text-2xl font-bold text-stone-900 font-outfit">{stats.activeMembers || 0} Members</p>
        </Card>
        <Card className="border border-stone-200 shadow-sm p-6 space-y-2">
          <div className="flex items-center gap-2 text-stone-500"><UserCheck className="h-5 w-5" /><span>Today's Total Payments</span></div>
          <p className="text-2xl font-bold text-stone-900 font-outfit text-green-600">{stats.todayPayments || 0}</p>
        </Card>
      </div>

      <Card className="border border-stone-200 shadow-sm">
        <CardHeader><CardTitle className="text-base font-semibold">Consolidated Auditing Matrix</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ledger Stream</TableHead>
                <TableHead>Target Parameter</TableHead>
                <TableHead>Aggregated Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Revenues</TableCell>
                <TableCell>Member Plan Purchases & Fees</TableCell>
                <TableCell className="text-green-600 font-bold">PKR {stats.todayRevenue || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Outflows</TableCell>
                <TableCell>Estimated Payouts</TableCell>
                <TableCell className="text-red-600 font-bold">PKR {stats.todayRevenue ? Math.round(stats.todayRevenue * 0.4) : 0}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
