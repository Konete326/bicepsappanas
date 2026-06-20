import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { validators, getErrClass } from "@/utils/validation";

export default function TrainerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "Male",
    baseSalary: "",
    commissionRate: ""
  });

  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const rules = {
      fullName: validators.name,
      email: validators.email,
      phone: validators.phone,
      baseSalary: validators.nonNegNum,
      commissionRate: validators.nonNegNum,
    };
    if (rules[field]) {
      setErrors((prev) => ({ ...prev, [field]: rules[field](value) }));
    }
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

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
          gender: data.gender || "Male",
          baseSalary: data.baseSalary ?? "",
          commissionRate: data.commissionRate ?? ""
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
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
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
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 rounded-xl p-6 bg-white shadow-sm">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="e.g. Ahmad Khan" className={getErrClass(errors, "fullName")} value={formData.fullName} onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); validate("fullName", e.target.value); }} onBlur={(e) => validate("fullName", e.target.value)} required />
          {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
            <SelectTrigger id="gender"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="e.g. ahmad@example.com" className={getErrClass(errors, "email")} value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); validate("email", e.target.value); }} onBlur={(e) => validate("email", e.target.value)} />
          {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="e.g. 03001234567" className={getErrClass(errors, "phone")} value={formData.phone} onChange={(e) => { const v = e.target.value.replace(/[^0-9+]/g, ""); setFormData({ ...formData, phone: v }); validate("phone", v); }} onBlur={(e) => validate("phone", formData.phone)} required />
          {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="baseSalary">Base Monthly Salary (PKR)</Label>
          <Input id="baseSalary" type="number" min={0} placeholder="Enter base salary" className={getErrClass(errors, "baseSalary")} value={formData.baseSalary} onChange={(e) => { setFormData({ ...formData, baseSalary: e.target.value === "" ? "" : parseInt(e.target.value) }); validate("baseSalary", e.target.value); }} onBlur={(e) => validate("baseSalary", formData.baseSalary)} required />
          {errors.baseSalary && <p className="text-[11px] text-red-500 mt-1">{errors.baseSalary}</p>}
        </div>
        <div>
          <Label htmlFor="commission">Commission Rate Per Session (PKR)</Label>
          <Input id="commission" type="number" min={0} placeholder="Enter commission rate" className={getErrClass(errors, "commissionRate")} value={formData.commissionRate} onChange={(e) => { setFormData({ ...formData, commissionRate: e.target.value === "" ? "" : parseInt(e.target.value) }); validate("commissionRate", e.target.value); }} onBlur={(e) => validate("commissionRate", formData.commissionRate)} required />
          {errors.commissionRate && <p className="text-[11px] text-red-500 mt-1">{errors.commissionRate}</p>}
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2 pt-4 border-t border-stone-100">
          <Button type="button" onClick={() => navigate("/trainers")}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending || hasErrors}>
            {mutation.isPending ? "Saving..." : "Save Trainer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
