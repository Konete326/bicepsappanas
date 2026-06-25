import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, DollarSign, AlertCircle, Calendar, Package, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export default function Dashboard() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await API.get("/dashboard");
      return res.data.data || {};
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-stone-500 h-10 w-10" />
      </div>
    );
  }

  const stats = dashData?.stats || {};
  const recentPayments = dashData?.recentPayments || [];
  const inventoryByCategory = dashData?.inventoryByCategory || [];
  const lowStockProducts = dashData?.lowStockProducts || [];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#14b8a6', '#f43f5e'];

  const kpis = [
    { label: "Active Members", value: stats.activeMembers || 0, icon: Users, color: "text-green-600" },
    { label: "Total Members", value: stats.totalMembers || 0, icon: Users, color: "text-stone-700" },
    { label: "Today's Revenue", value: `PKR ${Number(stats.todayRevenue || 0).toLocaleString("en-PK")}`, icon: DollarSign, color: "text-blue-600" },
    { label: "Today's Payments", value: stats.todayPayments || 0, icon: AlertCircle, color: "text-orange-600" }
  ];

  const chartData = [
    { name: "Active", value: stats.activeMembers || 0 },
    { name: "Expired", value: stats.expiredMembers || 0 },
    { name: "Frozen", value: stats.frozenMembers || 0 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="border border-stone-200 shadow-sm p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-stone-500 font-semibold">{kpi.label}</span>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <p className="text-xl font-bold text-stone-900 font-outfit">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-stone-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2 border-b border-stone-100">
            <CardTitle className="text-sm font-semibold">Membership Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2 border-b border-stone-100">
            <CardTitle className="text-sm font-semibold">Upcoming Expirations</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                <span className="text-xs text-stone-700">Expiring in 7 Days</span>
              </div>
              <Badge variant="outline" className="font-bold">{stats.expiringIn7Days || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-500" />
                <span className="text-xs text-stone-700">Expiring in 30 Days</span>
              </div>
              <Badge variant="outline" className="font-bold">{stats.expiringIn30Days || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-stone-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2 border-b border-stone-100">
            <CardTitle className="text-sm font-semibold">Inventory Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-64">
            {inventoryByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-stone-400 text-xs">No inventory data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1, height: 1 }}>
                <PieChart>
                  <Pie data={inventoryByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {inventoryByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2 border-b border-stone-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="pt-4 space-y-4 max-h-64 overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-4">No low stock items</p>
            ) : (
              lowStockProducts.map(product => (
                <div key={product._id} className="flex justify-between items-center border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-semibold text-stone-800 truncate">{product.name}</p>
                    <p className="text-[10px] text-stone-500">Threshold: {product.lowStockThreshold}</p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 whitespace-nowrap text-[10px]">
                    {product.stock} left
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-stone-200 shadow-sm">
        <CardHeader><CardTitle className="text-sm font-semibold">Recent Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt S.No</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-xs text-stone-500">
                    No recent payments found.
                  </TableCell>
                </TableRow>
              ) : (
                recentPayments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-semibold text-xs">S.No - {String(p.serialNo).padStart(3, "0")}</TableCell>
                    <TableCell className="text-xs">{p.memberId?.fullName || "Deleted Member"}</TableCell>
                    <TableCell className="text-xs">{p.paymentMethod}</TableCell>
                    <TableCell className="font-bold text-xs">PKR {Number(p.amountReceived).toLocaleString("en-PK")}</TableCell>
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
