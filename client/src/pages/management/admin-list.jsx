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
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminList() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "admin", 
    permissions: ["members", "measurements", "routines"] 
  });
  const [step, setStep] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await API.get("/auth/admins");
      return res.data.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => API.post("/auth/signup", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast({ title: "Account created successfully" });
      setFormData({ name: "", email: "", password: "", role: "admin", permissions: ["members", "measurements", "routines"] });
      setStep(1);
      setIsAdding(false);
    },
    onError: (err) => {
      toast({
        title: "Failed to create account",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => API.delete(`/auth/admins/${id}`),
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

  const availablePermissions = [
    { id: "members", label: "Members Management" },
    { id: "measurements", label: "Measurements" },
    { id: "routines", label: "Workout Routines" },
    { id: "payments", label: "Payments & Fees" },
    { id: "inventory", label: "Inventory Management" },
    { id: "pos", label: "Shop (POS)" },
    { id: "reports", label: "Financial Reports" }
  ];

  const togglePermission = (permId) => {
    setFormData(prev => {
      const perms = prev.permissions || [];
      if (perms.includes(permId)) return { ...prev, permissions: perms.filter(p => p !== permId) };
      return { ...prev, permissions: [...perms, permId] };
    });
  };

  const handleNextOrSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        return toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      }
      if (formData.role === "trainer") {
        setStep(2);
      } else {
        createMutation.mutate(formData);
      }
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            System Access
          </h2>
          <p className="text-sm text-stone-500 mt-1">Manage staff login accounts and system permissions.</p>
        </div>
        <Button onClick={() => { setStep(1); setIsAdding(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Create Account
        </Button>
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{step === 1 ? "Register New Account" : "Assign Permissions"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNextOrSubmit} className="space-y-4 mt-2">
            {step === 1 ? (
              <>
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
                    placeholder="e.g. user@gym.com"
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
                <div>
                  <Label className="text-xs text-stone-500 font-semibold mb-1 block">Role</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="trainer">Trainer (Custom Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {availablePermissions.map((perm) => (
                  <div key={perm.id} className="flex items-center space-x-3 p-2 border border-stone-100 rounded-lg">
                    <Checkbox
                      id={`perm-${perm.id}`}
                      checked={(formData.permissions || []).includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <label htmlFor={`perm-${perm.id}`} className="text-sm font-semibold text-stone-800 cursor-pointer flex-1">
                      {perm.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              {step === 2 && (
                <Button type="button" variant="outline" className="rounded-lg mr-auto" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-stone-800 hover:bg-stone-700 text-white rounded-lg px-6" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 1 && formData.role === "trainer" ? "Next" : "Save Account"}
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      admin.role === "admin" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}>
                      {admin.role || "admin"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {admin._id !== user?._id && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-colors"
                        onClick={() => setConfirmState({ open: true, id: admin._id, name: admin.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
