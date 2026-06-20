import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function TrainerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    baseSalary: 0,
    commissionRate: 0
  });

  const { isLoading: loadingTrainer } = useQuery({
    queryKey: ["trainer", id],
    queryFn: async () => {
      const res = await API.get(`/trainers/${id}`);
      const data = res.data.data;
      if (data) {
        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          baseSalary: data.baseSalary || 0,
          commissionRate: data.commissionRate || 0
        });
      }
      return data;
    },
    enabled: !!id
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (id) {
        return API.put(`/trainers/${id}`, payload);
      }
      return API.post("/trainers", payload);
    },
    onSuccess: () => {
      toast({ title: `Trainer details successfully ${id ? "updated" : "saved"}` });
      navigate("/trainers");
    },
    onError: (err) => {
      toast({
        title: "Operation failed",
        description: err.response?.data?.message || "Invalid values provided.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (loadingTrainer) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 font-outfit uppercase">{id ? "Edit Trainer" : "Register Trainer"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 border border-stone-200 rounded-xl p-6 bg-white shadow-sm">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="baseSalary">Base Monthly Salary (PKR)</Label>
          <Input id="baseSalary" type="number" min={0} value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 0 })} required />
        </div>
        <div>
          <Label htmlFor="commission">Commission Rate Per Session (PKR)</Label>
          <Input id="commission" type="number" min={0} value={formData.commissionRate} onChange={(e) => setFormData({ ...formData, commissionRate: parseInt(e.target.value) || 0 })} required />
        </div>
        <div className="sm:col-span-4 flex justify-end gap-2 pt-4 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={() => navigate("/trainers")}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Trainer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
