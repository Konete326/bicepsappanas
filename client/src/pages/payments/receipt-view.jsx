import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Printer } from "lucide-react";

export default function ReceiptView() {
  const { id } = useParams();

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      const res = await API.get(`/payments/${id}`);
      return res.data.data;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-stone-500">Receipt not found.</p>
        <Link to="/payments">
          <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Log</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center print:hidden">
        <Link to="/payments">
          <Button size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Log</Button>
        </Link>
        <Button onClick={handlePrint} size="sm"><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
      </div>

      <Card className="border-2 border-stone-200 shadow-md p-6 bg-white space-y-6">
        <CardHeader className="text-center pb-4 border-b-2 border-stone-100">
          <h1 className="text-2xl font-black tracking-widest text-stone-900 uppercase font-outfit">WRECK & BUILD</h1>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Ladies & Gents Fitness Gym</p>
          <p className="text-[10px] text-stone-400">Nazimabad No 5, Karachi | WhatsApp Support</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-stone-600">Receipt S.No:</span>
            <span className="text-stone-900">S.No - {String(payment.serialNo).padStart(3, "0")}</span>
          </div>

          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-stone-600">Payment Date:</span>
            <span className="text-stone-900">{new Date(payment.date).toLocaleDateString()}</span>
          </div>

          <div className="border-t border-b border-stone-100 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600 font-medium">Received From:</span>
              <span className="text-stone-900 font-bold">{payment.memberId?.fullName || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600 font-medium">Roll Number:</span>
              <span className="text-stone-900 font-semibold">{payment.memberId?.rollNo || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600 font-medium">Payment Method:</span>
              <span className="text-stone-900 font-semibold">{payment.paymentMethod}</span>
            </div>
            {payment.chequeOrTransactionNo && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 font-medium">Reference Code:</span>
                <span className="text-stone-900 font-mono text-xs">{payment.chequeOrTransactionNo}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-bold text-stone-900">Total Paid:</span>
            <span className="text-xl font-black text-stone-950">PKR {payment.amountReceived}</span>
          </div>

          <div className="flex justify-between items-center pt-10 text-[10px] text-stone-500 font-semibold">
            <span>Verified Stamp & Signature</span>
            <span className="border-t border-stone-300 pt-1 w-32 text-center uppercase">{payment.receiverStampSignature}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
