import { useState, useEffect, useRef } from "react";
import { Bell, Package, Check, Trash2, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import API from "@/api/api";
import { useToast } from "@/hooks/use-toast";

function getNotificationRoute(n) {
    const memberId = n.member?._id || n.member;
    const trainerId = n.trainer?._id || n.trainer;
    switch (n.type) {
        case "expiry":      return memberId ? `/members/${memberId}` : "/members";
        case "dues":        return "/payments/dues";
        case "measurement": return memberId ? `/measurements/${memberId}` : "/measurements";
        case "salary":      return trainerId ? `/trainers/${trainerId}/ledger` : "/trainers";
        default:            return "/";
    }
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data.data);
            setUnreadCount(res.data.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await API.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            toast({ title: "Error", description: "Failed to update notification", variant: "destructive" });
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await API.delete(`/notifications/${id}`);
            fetchNotifications();
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
        }
    };

    const handleNotificationClick = async (n) => {
        setPopoverOpen(false);
        if (!n.isRead) {
            try { await API.patch(`/notifications/${n._id}/read`); } catch {}
        }
        navigate(getNotificationRoute(n));
    };

    const clearAll = async () => {
        try {
            await API.delete("/notifications/clear");
            setNotifications([]);
            setUnreadCount(0);
            setConfirmClearOpen(false);
            toast({ title: "All notifications cleared" });
        } catch (err) {
            toast({ title: "Error", description: "Failed to clear notifications", variant: "destructive" });
        }
    };

    return (
        <>
            <Popover open={popoverOpen} onOpenChange={(open) => { setPopoverOpen(open); if (open) fetchNotifications(); }}>
                <PopoverTrigger asChild>
                    <Button size="icon" className="relative bg-white text-stone-900 hover:bg-stone-100 border border-stone-900">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 animate-pulse border-white">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 mr-4 mt-2 shadow-2xl border-stone-200" align="end">
                    <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-stone-900">Notifications</h4>
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmClearOpen(true)}
                                className="h-7 text-[10px] font-bold text-stone-400 hover:text-red-600 px-2"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Clear All
                            </Button>
                        )}
                    </div>
                    <ScrollArea className="h-[350px]">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="h-8 w-8 text-stone-200 mx-auto mb-2" />
                                <p className="text-xs text-stone-400 font-medium">All caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        className={`p-4 flex gap-3 transition-colors relative group cursor-pointer hover:bg-stone-100/60 ${n.isRead ? 'opacity-60 bg-white' : 'bg-stone-50/50'}`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'low-stock' ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-600'}`}>
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-[11px] font-bold text-stone-900 leading-tight mb-1 flex items-center gap-1">
                                                {n.title}
                                                <ExternalLink className="h-2.5 w-2.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </p>
                                            <p className="text-[10px] text-stone-500 font-medium leading-relaxed">{n.message}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[9px] text-stone-400 font-bold uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {!n.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                                                        className="h-6 text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-50 px-2"
                                                    >
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Mark as Read
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => deleteNotification(e, n._id)}
                                            className="absolute top-2 right-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    {notifications.length > 0 && (
                        <div className="p-2 border-t border-stone-100 bg-stone-50/30 text-center">
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Inventory Guard Active</p>
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Notifications?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove all notifications. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAll} className="bg-red-600 hover:bg-red-700">
                            Clear All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
