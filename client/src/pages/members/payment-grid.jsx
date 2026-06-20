import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function PaymentGrid({ memberId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: grid, isLoading } = useQuery({
    queryKey: ["payment-grid", memberId],
    queryFn: async () => {
      const res = await API.get(`/members/payment-grid/${memberId}`);
      return res.data.data.paymentGrid || {};
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (monthIndex) => {
      const res = await API.post(`/members/payment-grid/${memberId}/toggle`, { monthIndex });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payment-grid", memberId]);
      toast({ title: "Status updated successfully" });
    },
    onError: (err) => {
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-2 p-4">
      {MONTHS.map((month, idx) => {
        const isPaid = grid && grid[idx] === true;
        return (
          <div key={month} className="border border-stone-200 rounded-md p-2 flex flex-col items-center gap-1.5 bg-stone-50 hover:bg-stone-100 transition-colors">
            <span className="text-[10px] font-semibold text-stone-500 uppercase">{month}</span>
            <Badge className={`text-[9px] px-1.5 py-0 h-4 ${isPaid ? "bg-green-600 text-white hover:bg-green-600/80 border-transparent" : "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent"}`}>
              {isPaid ? "Paid" : "Unpaid"}
            </Badge>
            <button
              className="text-[9px] font-medium px-2 py-0.5 rounded border border-stone-300 bg-white hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={toggleMutation.isPending}
              onClick={() => toggleMutation.mutate(idx)}
            >
              {isPaid ? "Undo" : "Pay"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
