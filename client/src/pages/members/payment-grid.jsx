import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ConfirmModal({ open, onConfirm, onCancel, month, action }) {
  if (!open) return null;
  const isPaying = action === "pay";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[360px] overflow-hidden">
        <div className={`h-1.5 w-full ${isPaying ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-amber-400 to-orange-400"}`} />
        <div className="p-6">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <X size={13} className="text-stone-500" />
          </button>

          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isPaying ? "bg-emerald-50" : "bg-amber-50"}`}>
            {isPaying
              ? <CheckCircle2 size={22} className="text-emerald-600" />
              : <AlertTriangle size={22} className="text-amber-500" />}
          </div>

          <p className="text-center text-sm font-bold text-stone-900 mb-1">
            {isPaying ? `Mark ${month} as Paid?` : `Undo ${month} Payment?`}
          </p>
          <p className="text-center text-[11px] text-stone-400 mb-5">
            {isPaying
              ? "This will record a payment entry for this month."
              : "This will remove the payment record for this month."}
          </p>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl text-white transition-colors ${isPaying ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600"}`}
            >
              {isPaying ? "Yes, Mark Paid" : "Yes, Undo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentGrid({ memberId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pending, setPending] = useState(null);

  const { data: grid, isLoading } = useQuery({
    queryKey: ["payment-grid", memberId],
    queryFn: async () => {
      const res = await API.get(`/members/payment-grid/${memberId}`);
      return res.data.data.paymentGrid || {};
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (monthIndex) => {
      const res = await API.post(`/members/payment-grid/${memberId}/toggle`, { monthIndex });
      return res.data;
    },
    onSuccess: (_, monthIndex) => {
      queryClient.invalidateQueries({ queryKey: ["payment-grid", memberId] });
      const wasPaid = grid && grid[monthIndex] === true;
      toast({
        title: wasPaid ? "Payment undone" : "Payment recorded",
        description: `${MONTH_FULL[monthIndex]} has been marked as ${wasPaid ? "unpaid" : "paid"}.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleClick = (idx, isPaid) => {
    setPending({ idx, month: MONTHS[idx], action: isPaid ? "undo" : "pay" });
  };

  const handleConfirm = () => {
    if (!pending) return;
    const isPaid = grid && grid[pending.idx] === true;
    if (pending.action === "pay" && isPaid) {
      toast({
        title: `${pending.month} is already paid`,
        description: "This month's payment has already been recorded.",
        variant: "destructive",
      });
      setPending(null);
      return;
    }
    toggleMutation.mutate(pending.idx);
    setPending(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="animate-spin text-stone-400" size={20} />
      </div>
    );
  }

  const paidCount = MONTHS.reduce((acc, _, i) => acc + (grid && grid[i] === true ? 1 : 0), 0);
  const currentMonth = new Date().getMonth();

  return (
    <>
      <ConfirmModal
        open={!!pending}
        month={pending?.month}
        action={pending?.action}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {MONTHS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  grid && grid[i] === true
                    ? "bg-emerald-500 w-4"
                    : i === currentMonth
                    ? "bg-amber-400 w-3"
                    : "bg-rose-400 w-2"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Paid ({paidCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Unpaid ({12 - paidCount})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {MONTHS.map((month, idx) => {
          const isPaid = grid && grid[idx] === true;
          const isCurrent = idx === currentMonth;

          return (
            <div
              key={month}
              className={`relative rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all duration-200 group ${
                isPaid
                  ? "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100"
                  : isCurrent
                  ? "bg-amber-50 border-amber-200 shadow-sm shadow-amber-100"
                  : "bg-rose-50 border-rose-200 shadow-sm shadow-rose-100"
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none tracking-wide">
                  NOW
                </span>
              )}

              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isPaid ? "text-emerald-700" : isCurrent ? "text-amber-700" : "text-rose-600"
              }`}>
                {month}
              </span>

              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isPaid ? "bg-emerald-100" : isCurrent ? "bg-amber-100" : "bg-rose-100"
              }`}>
                {isPaid ? (
                  <CheckCircle2 size={13} className="text-emerald-600" />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-amber-400" : "bg-rose-500"}`} />
                )}
              </div>

              <span className={`text-[9px] font-semibold tracking-wide ${
                isPaid ? "text-emerald-600" : isCurrent ? "text-amber-600" : "text-rose-500"
              }`}>
                {isPaid ? "PAID" : "UNPAID"}
              </span>

              <button
                onClick={() => handleClick(idx, isPaid)}
                disabled={toggleMutation.isPending}
                className={`w-full py-1 text-[9px] font-bold rounded-lg tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isPaid
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200"
                }`}
              >
                {isPaid ? "Undo" : "Pay"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
