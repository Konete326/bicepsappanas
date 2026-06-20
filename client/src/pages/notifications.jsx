import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bell, CheckCircle, Trash2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await API.get("/notifications");
      return res.data.data || [];
    }
  });

  const clearMutation = useMutation({
    mutationFn: async () => API.delete("/notifications/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast({ title: "All notifications cleared" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => API.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast({ title: "Notification deleted" });
    }
  });

  const readMutation = useMutation({
    mutationFn: async (id) => API.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">System Notifications</h2>
        {notifications?.length > 0 && (
          <Button size="sm" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
            <CheckCircle className="mr-2 h-4 w-4" /> Clear All
          </Button>
        )}
      </div>

      <div className="max-w-xs">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="read">Read Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-stone-500 space-y-2">
              <Bell className="mx-auto h-8 w-8 text-stone-300" />
              <p className="text-xs">No active alerts or notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {notifications.filter((n) => {
                if (filter === "unread") return !n.isRead;
                if (filter === "read") return n.isRead;
                return true;
              }).length === 0 ? (
                <div className="p-6 text-center text-stone-500 space-y-2">
                  <Bell className="mx-auto h-8 w-8 text-stone-300" />
                  <p className="text-xs">No {filter !== "all" ? filter : ""} notifications.</p>
                </div>
              ) : (
                notifications.filter((n) => {
                  if (filter === "unread") return !n.isRead;
                  if (filter === "read") return n.isRead;
                  return true;
                }).map((n) => (
                <div key={n._id} className={`p-4 hover:bg-stone-50 transition-colors flex items-start gap-3 ${!n.isRead ? "bg-stone-50/50" : ""}`}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 mt-0.5"
                    onClick={() => readMutation.mutate(n._id)}
                    title={n.isRead ? "Read" : "Mark as read"}
                  >
                    {n.isRead ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-stone-400" />
                    )}
                  </Button>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-stone-950 text-sm">{n.title}</p>
                    <p className="text-xs text-stone-600">{n.message}</p>
                    <span className="text-[10px] text-stone-400">
                      {new Date(n.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => deleteMutation.mutate(n._id)}
                    disabled={deleteMutation.isPending}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-stone-400 hover:text-red-500" />
                  </Button>
                </div>
              ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
