import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Shield, Plus, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function AdminList() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await API.get("/admins");
      return res.data.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => API.post("/signup", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast({ title: "Admin created successfully" });
      setFormData({ name: "", email: "", password: "" });
      setIsAdding(false);
    },
    onError: (err) => {
      toast({
        title: "Failed to create admin",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => API.delete(`/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast({ title: "Admin deleted successfully" });
      setConfirmState({ open: false, id: null, name: "" });
    },
    onError: (err) => {
      toast({
        title: "Failed to delete admin",
        description: err.response?.data?.message || "Cannot delete yourself or admin not found.",
        variant: "destructive"
      });
      setConfirmState({ open: false, id: null, name: "" });
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            System Admins
          </h2>
          <p className="text-sm text-stone-500 mt-1">Manage secondary admin accounts with full dashboard access.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Admin
        </Button>
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Register New Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-stone-500 font-semibold mb-1 block">Full Name</Label>
              <Input
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs text-stone-500 font-semibold mb-1 block">Email</Label>
              <Input
                type="email"
                placeholder="e.g. admin2@gym.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs text-stone-500 font-semibold mb-1 block">Password</Label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-stone-800 hover:bg-stone-700 text-white rounded-lg px-6" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Admin
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center h-32">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead>Admin Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-24">Role</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins?.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell className="font-semibold text-stone-900 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      <User size={14} />
                    </div>
                    {admin.name}
                  </TableCell>
                  <TableCell className="text-stone-600">{admin.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                      Admin
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-colors"
                      onClick={() => setConfirmState({ open: true, id: admin._id, name: admin.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {admins?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-stone-500 py-8">
                    No secondary admins found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title="Delete Admin"
        message={`Are you sure you want to remove access for "${confirmState.name}"? They will no longer be able to log in.`}
        confirmLabel="Yes, Remove Access"
        onConfirm={() => deleteMutation.mutate(confirmState.id)}
        onCancel={() => setConfirmState({ open: false, id: null, name: "" })}
      />
    </div>
  );
}
