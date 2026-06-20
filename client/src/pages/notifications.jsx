import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Loader2, Bell, CheckCircle, Trash2, Circle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // null | "all" | notification id
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await API.get("/notifications");
      return res.data.data || [];
    }
  });

  const filtered = (notifications || []).filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  }).filter((n) => {
    if (typeFilter !== "all") return n.type === typeFilter;
    return true;
  }).filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
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
      setIsDialogOpen(false);
      setDeleteTarget(null);
    }
  });

  const openDeleteConfirm = (id) => { setDeleteTarget(id); setIsDialogOpen(true); };
  const openClearAllConfirm = () => { setDeleteTarget("all"); setIsDialogOpen(true); };
  const handleConfirmDelete = () => {
    if (deleteTarget === "all") clearMutation.mutate();
    else if (deleteTarget) deleteMutation.mutate(deleteTarget);
  };

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
          <Button size="sm" onClick={openClearAllConfirm} disabled={clearMutation.isPending}>
            <CheckCircle className="mr-2 h-4 w-4" /> Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="relative sm:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="sm:col-span-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="expiry">Expiry</SelectItem>
              <SelectItem value="dues">Dues</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="measurement">Measurement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 flex items-center text-sm text-stone-500 border border-stone-200 rounded-md bg-stone-50 px-3 justify-center">
          {filtered.length} result(s)
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-stone-500 space-y-2">
              <Bell className="mx-auto h-8 w-8 text-stone-300" />
              <p className="text-xs">No active alerts or notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filtered.map((n) => (
                <div key={n._id} className={`p-4 hover:bg-stone-50 transition-colors flex items-start gap-3 ${!n.isRead ? "bg-stone-50/50" : ""}`}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 mt-0.5 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg"
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
                    className="h-8 w-8 shrink-0 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg"
                    onClick={() => openDeleteConfirm(n._id)}
                    disabled={deleteMutation.isPending}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-stone-400 hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget === "all" ? "Clear All Notifications?" : "Delete Notification?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === "all"
                ? "This will permanently remove all notifications. This action cannot be undone."
                : "Are you sure you want to delete this notification? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              {(deleteTarget === "all" ? clearMutation.isPending : deleteMutation.isPending) ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {deleteTarget === "all" ? "Clear All" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
