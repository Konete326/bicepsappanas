import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PaymentGrid({ memberId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: grid, isLoading } = useQuery({
    queryKey: ["payment-grid", memberId],
    queryFn: async () => {
      const res = await API.get(`/members/payment-grid/${memberId}`);
      return res.data.data || {};
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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
      {MONTHS.map((month, idx) => {
        const isPaid = grid && grid[idx] === true;
        return (
          <div key={month} className="border border-stone-200 rounded-lg p-3 flex flex-col items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors">
            <span className="text-xs font-semibold text-stone-600 mb-2">{month}</span>
            <Badge variant={isPaid ? "default" : "destructive"} className="mb-2">
              {isPaid ? "Paid" : "Unpaid"}
            </Badge>
            <Button
              size="sm"
              className="text-[10px] h-7 px-2"
              disabled={toggleMutation.isPending}
              onClick={() => toggleMutation.mutate(idx)}
            >
              Toggle
            </Button>
          </div>
        );
      })}
    </div>
  );
}
