import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/format";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Eye, Calendar, Receipt, ShoppingCart, CreditCard, Banknote, Search } from "lucide-react";

export default function SalesHistory() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales", startDate, endDate, paymentMethod, searchTerm],
    queryFn: async () => {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (paymentMethod !== "All") params.paymentMethod = paymentMethod;
      if (searchTerm) params.search = searchTerm;
      const res = await API.get("/sales", { params });
      return res.data.data || [];
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-stone-700" />
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Sales History</h2>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 max-w-5xl">
            <div className="sm:col-span-4">
              <Label className="text-xs flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Customer Search
              </Label>
              <Input
                placeholder="Search by name..."
                className="h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Label className="text-xs flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Start Date
              </Label>
              <Input
                type="date"
                className="h-9"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Label className="text-xs flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                End Date
              </Label>
              <Input
                type="date"
                className="h-9"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Payment
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Easy Paisa">Easy Paisa</SelectItem>
                  <SelectItem value="Jazz Cash">Jazz Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-green-600">Profit</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sales || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-stone-500 py-10">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="h-8 w-8 text-stone-300" />
                      <p>No sales found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {(sales || []).map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell className="font-medium">{formatDate(sale.createdAt)}</TableCell>
                  <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{sale.items?.length || 0}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    PKR {Number(sale.totalAmount).toLocaleString("en-PK")}
                  </TableCell>
                  <TableCell className="font-bold text-green-600 bg-green-50/50">
                    PKR {Number(sale.totalProfit || 0).toLocaleString("en-PK")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {sale.paymentMethod === "Cash" ? (
                        <Banknote className="h-3 w-3" />
                      ) : (
                        <CreditCard className="h-3 w-3" />
                      )}
                      {sale.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg"
                      onClick={() => setSelectedSale(sale)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-outfit uppercase text-base">Sale Details</DialogTitle>
            <DialogDescription>
              {selectedSale && `Sale on ${formatDate(selectedSale.createdAt)}`}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Customer</p>
                  <p className="font-semibold text-stone-800">{selectedSale.customerName || "Walk-in"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Payment Method</p>
                  <p className="font-semibold text-stone-800">{selectedSale.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Date</p>
                  <p className="font-semibold text-stone-800">{formatDate(selectedSale.createdAt)}</p>
                </div>
              </div>

              <div className="border border-stone-200 rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right text-green-600">Margin</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedSale.items || []).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          PKR {Number(item.unitPrice).toLocaleString("en-PK")}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600 bg-green-50/30">
                          PKR {Number((item.unitPrice - (item.costPrice || 0)) * item.quantity).toLocaleString("en-PK")}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          PKR {Number(item.total).toLocaleString("en-PK")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-2 border-t border-stone-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-600">Net Profit (Bachhat)</span>
                  <span className="text-sm font-bold text-green-600">
                    PKR {Number(selectedSale.totalProfit || 0).toLocaleString("en-PK")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-stone-900">Grand Total</span>
                  <span className="text-lg font-bold text-stone-900">
                    PKR {Number(selectedSale.totalAmount).toLocaleString("en-PK")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
