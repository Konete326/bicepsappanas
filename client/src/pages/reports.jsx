import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/format";
import API from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Users, CreditCard, TrendingUp, CalendarDays, Receipt } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="border border-stone-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{label}</p>
            <p className={`text-2xl font-black font-outfit ${accent || "text-stone-900"}`}>{value}</p>
            {sub && <p className="text-xs text-stone-400 font-medium">{sub}</p>}
          </div>
          <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-stone-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports-data"],
    queryFn: async () => {
      const res = await API.get("/reports");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-stone-400 h-6 w-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center h-[50vh]">
        <p className="text-sm text-rose-500 font-medium">Failed to load reports. Please try again.</p>
      </div>
    );
  }

  const { summary, memberStatus, paymentMethodBreakdown, monthlyTrend, recentPayments } = data;

  const maxTrend = Math.max(...(monthlyTrend.map(m => m.revenue) || [1]), 1);

  return (
    <div className="p-4 lg:p-6 space-y-6">

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="col-span-2 md:col-span-3 lg:col-span-2">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`PKR ${summary.totalRevenue.toLocaleString()}`}
            sub={`${summary.totalPayments} payments all time`}
            accent="text-stone-900"
          />
        </div>
        <div className="col-span-2 md:col-span-1 lg:col-span-2">
          <StatCard
            icon={CalendarDays}
            label="This Month"
            value={`PKR ${summary.monthRevenue.toLocaleString()}`}
            sub={`${summary.monthPayments} payments`}
            accent="text-blue-700"
          />
        </div>
        <div className="col-span-2 md:col-span-2 lg:col-span-2">
          <StatCard
            icon={TrendingUp}
            label="Today's Revenue"
            value={`PKR ${summary.todayRevenue.toLocaleString()}`}
            sub={`${summary.todayPayments} payments today`}
            accent="text-emerald-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-stone-700 flex items-center gap-2">
              <Users className="h-4 w-4" /> Member Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Active", count: memberStatus.Active || 0, color: "bg-emerald-500" },
              { label: "Expired", count: memberStatus.Expired || 0, color: "bg-rose-400" },
              { label: "Frozen", count: memberStatus.Frozen || 0, color: "bg-blue-400" },
            ].map(({ label, count, color }) => {
              const total = (memberStatus.Active || 0) + (memberStatus.Expired || 0) + (memberStatus.Frozen || 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs font-semibold text-stone-600 mb-1">
                    <span>{label}</span>
                    <span>{count} <span className="text-stone-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-stone-700 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {paymentMethodBreakdown.length === 0 ? (
              <p className="text-xs text-stone-400 font-medium">No payments recorded yet.</p>
            ) : (
              paymentMethodBreakdown.map((m) => (
                <div key={m._id} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600">{m._id}</span>
                  <div className="text-right">
                    <p className="text-xs font-black text-stone-900">PKR {m.total.toLocaleString()}</p>
                    <p className="text-[10px] text-stone-400">{m.count} txns</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-stone-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length === 0 ? (
              <p className="text-xs text-stone-400 font-medium">No data yet.</p>
            ) : (
              <div className="flex items-end gap-1 h-20">
                {monthlyTrend.map((m) => {
                  const h = Math.max(Math.round((m.revenue / maxTrend) * 100), 4);
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className="w-full bg-stone-800 rounded-t-sm transition-all duration-300 group-hover:bg-stone-600 relative"
                        style={{ height: `${h}%` }}
                        title={`${m.month}: PKR ${m.revenue.toLocaleString()}`}
                      />
                      <span className="text-[8px] text-stone-400 font-bold truncate w-full text-center">{m.month.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-stone-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial No</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-stone-400 py-8">No payments recorded yet.</TableCell>
                </TableRow>
              ) : (
                recentPayments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-xs text-stone-500">#{p.serialNo}</TableCell>
                    <TableCell className="font-semibold text-stone-800">{p.memberId?.fullName || "—"}</TableCell>
                    <TableCell className="text-stone-500 text-xs">{p.memberId?.rollNo || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-semibold">{p.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {formatDate(p.date)}
                    </TableCell>
                    <TableCell className="text-right font-black text-stone-900 font-outfit">
                      PKR {p.amountReceived.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
