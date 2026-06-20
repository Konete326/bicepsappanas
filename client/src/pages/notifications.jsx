import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await API.get("/notifications");
      return res.data.data || [];
    }
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      return API.post("/notifications/clear");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast({ title: "Notifications cleared successfully" });
    }
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">System Notifications</h2>
        {notifications?.length > 0 && (
          <Button size="sm" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
            <CheckCircle className="mr-2 h-4 w-4" /> Clear All
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <Card className="border border-stone-200 shadow-sm bg-white">
          <CardContent className="p-0 divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-stone-500 space-y-2">
                <Bell className="mx-auto h-8 w-8 text-stone-300" />
                <p className="text-xs">No active alerts or notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="p-4 hover:bg-stone-50 transition-colors flex gap-3 text-xs">
                  <Bell className="h-5 w-5 text-stone-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-stone-950">{n.title}</p>
                    <p className="text-stone-600">{n.message}</p>
                    <span className="text-[10px] text-stone-400">
                      {new Date(n.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
