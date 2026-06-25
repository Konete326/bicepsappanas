import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/format";
import API from "@/api/api";
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
      <div className="flex flex-1 items-center justify-center h-[50vh]">
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Link to="/payments">
          <Button size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Log</Button>
        </Link>
        <Button onClick={handlePrint} size="sm"><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
      </div>

      {/* ─── Two Column Layout ─── */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left Side — Details */}
        <div className="flex-1 border border-stone-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-stone-900 font-outfit uppercase border-b border-stone-100 pb-2">Receipt Details</h3>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between"><span className="text-stone-500">Member Name</span><span className="font-semibold text-stone-900">{payment.memberId?.fullName || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Father's Name</span><span className="font-semibold text-stone-900">{payment.memberId?.fatherName || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Roll Number</span><span className="font-semibold text-stone-900">{payment.memberId?.rollNo || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Cell Number</span><span className="font-semibold text-stone-900">{payment.memberId?.cellNo || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">CNIC</span><span className="font-semibold text-stone-900">{payment.memberId?.cnic || "N/A"}</span></div>
            <div className="border-t border-dashed border-stone-100 my-1"></div>
            <div className="flex justify-between"><span className="text-stone-500">Receipt S.No</span><span className="font-semibold text-stone-900">{String(payment.serialNo).padStart(3, "0")}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Date</span><span className="font-semibold text-stone-900">{formatDate(payment.date)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Payment Method</span><span className="font-semibold text-stone-900">{payment.paymentMethod}</span></div>
            {payment.chequeOrTransactionNo && (
              <div className="flex justify-between"><span className="text-stone-500">Ref Code</span><span className="font-mono text-stone-900">{payment.chequeOrTransactionNo}</span></div>
            )}
            <div className="border-t border-dashed border-stone-100 my-1"></div>
            <div className="flex justify-between"><span className="text-stone-500">Amount Paid</span><span className="font-bold text-sm text-stone-900">PKR {Number(payment.amountReceived).toLocaleString("en-PK")}</span></div>
          </div>
        </div>

        {/* Right Side — Thermal Receipt Preview */}
        <div className="thermal-receipt w-[80mm] shrink-0 bg-white border border-stone-200 shadow-sm font-mono text-[11px] text-stone-900 p-4 flex flex-col justify-between">
        {/* Header */}
        <div className="text-center py-2 border-b border-dashed border-stone-300">
          <h1 className="text-base font-black tracking-widest uppercase leading-tight">WRECK & BUILD</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Ladies & Gents Fitness Gym</p>
          <p className="text-[9px] text-stone-500">Nazimabad No 5, Karachi | WhatsApp Support</p>
        </div>

        {/* Receipt Info */}
        <div className="py-2 border-b border-dashed border-stone-300 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-stone-500">Receipt S.No:</span>
            <span className="font-bold">S.No - {String(payment.serialNo).padStart(3, "0")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Date:</span>
            <span className="font-semibold">{formatDate(payment.date)}</span>
          </div>
        </div>

        {/* Member Details */}
        <div className="py-2 border-b border-dashed border-stone-300 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-stone-500">Received From:</span>
            <span className="font-bold">{payment.memberId?.fullName || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Roll No:</span>
            <span className="font-semibold">{payment.memberId?.rollNo || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">CNIC:</span>
            <span className="font-semibold">{payment.memberId?.cnic || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Payment Method:</span>
            <span className="font-semibold">{payment.paymentMethod}</span>
          </div>
          {payment.chequeOrTransactionNo && (
            <div className="flex justify-between">
              <span className="text-stone-500">Ref Code:</span>
              <span className="font-mono text-[10px]">{payment.chequeOrTransactionNo}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="py-2 border-b border-dashed border-stone-300">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">Total Paid:</span>
            <span className="text-lg font-black">PKR {Number(payment.amountReceived).toLocaleString("en-PK")}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 pb-2 text-center space-y-2">
          <div className="flex justify-between items-end text-[9px] text-stone-500">
            <span>Verified Stamp & Signature</span>
            <span className="border-t border-stone-400 pt-0.5 px-2 uppercase">{payment.receiverStampSignature || "________"}</span>
          </div>
          <p className="text-[8px] text-stone-400 pt-2 border-t border-dashed border-stone-200 mt-2">Thank you for choosing WRECK & BUILD!</p>
        </div>
        </div>
      </div>
    </div>
  );
}
