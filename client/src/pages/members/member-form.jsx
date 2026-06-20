import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { validators, getErrClass } from "@/utils/validation";

export default function MemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    rollNo: "",
    fullName: "",
    fatherName: "",
    email: "",
    cellNo: "+92",
    address: "",
    joiningDate: new Date().toISOString().split("T")[0],
    renewalDate: "",
    status: "Active",
    planLink: ""
  });

  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const rules = {
      rollNo: validators.rollNo,
      fullName: validators.name,
      fatherName: validators.name,
      email: validators.email,
      cellNo: validators.phone,
      address: validators.text,
    };
    if (rules[field]) {
      setErrors((prev) => ({ ...prev, [field]: rules[field](value) }));
    }
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await API.get("/plans");
      return res.data.data || [];
    }
  });

  const { isLoading: loadingMember } = useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const res = await API.get(`/members/${id}`);
      const data = res.data.data;
      if (data) {
        setFormData({
          rollNo: data.rollNo || "",
          fullName: data.fullName || "",
          fatherName: data.fatherName || "",
          email: data.email || "",
          cellNo: data.cellNo || "+92",
          address: data.address || "",
          joiningDate: new Date(data.joiningDate).toISOString().split("T")[0],
          renewalDate: new Date(data.renewalDate).toISOString().split("T")[0],
          status: data.status || "Active",
          planLink: data.planLink?._id || data.planLink || ""
        });
      }
      return data;
    },
    enabled: !!id
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (id) {
        return API.put(`/members/${id}`, payload);
      }
      return API.post("/members", payload);
    },
    onSuccess: () => {
      toast({ title: `Member successfully ${id ? "updated" : "registered"}` });
      navigate("/members");
    },
    onError: (err) => {
      toast({
        title: "Error saving member",
        description: err.response?.data?.message || "Verify the inputs are correct and Roll No is unique.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (loadingMember || loadingPlans) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 font-outfit uppercase">{id ? "Edit Member" : "Register New Member"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 border border-stone-200 rounded-xl p-6 bg-white shadow-sm">
        <div>
          <Label htmlFor="rollNo">Roll Number</Label>
          <Input id="rollNo" className={getErrClass(errors, "rollNo")} value={formData.rollNo} onChange={(e) => { setFormData({ ...formData, rollNo: e.target.value }); validate("rollNo", e.target.value); }} onBlur={(e) => validate("rollNo", e.target.value)} required />
          {errors.rollNo && <p className="text-[11px] text-red-500 mt-1">{errors.rollNo}</p>}
        </div>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" className={getErrClass(errors, "fullName")} value={formData.fullName} onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); validate("fullName", e.target.value); }} onBlur={(e) => validate("fullName", e.target.value)} required />
          {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="fatherName">Father's Name</Label>
          <Input id="fatherName" className={getErrClass(errors, "fatherName")} value={formData.fatherName} onChange={(e) => { setFormData({ ...formData, fatherName: e.target.value }); validate("fatherName", e.target.value); }} onBlur={(e) => validate("fatherName", e.target.value)} required />
          {errors.fatherName && <p className="text-[11px] text-red-500 mt-1">{errors.fatherName}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" className={getErrClass(errors, "email")} value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); validate("email", e.target.value); }} onBlur={(e) => validate("email", e.target.value)} />
          {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="cellNo">Cell Number</Label>
          <Input id="cellNo" className={getErrClass(errors, "cellNo")} value={formData.cellNo} onChange={(e) => { setFormData({ ...formData, cellNo: e.target.value }); validate("cellNo", e.target.value); }} onBlur={(e) => validate("cellNo", e.target.value)} placeholder="+923000000000" required />
          {errors.cellNo && <p className="text-[11px] text-red-500 mt-1">{errors.cellNo}</p>}
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" className={getErrClass(errors, "address")} value={formData.address} onChange={(e) => { setFormData({ ...formData, address: e.target.value }); validate("address", e.target.value); }} onBlur={(e) => validate("address", e.target.value)} required />
          {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
        </div>
        <div>
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input id="joiningDate" type="date" value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="renewalDate">Renewal Date</Label>
          <Input id="renewalDate" type="date" value={formData.renewalDate} onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="planLink">Select Plan</Label>
          <Select value={formData.planLink} onValueChange={(val) => setFormData({ ...formData, planLink: val })}>
            <SelectTrigger><SelectValue placeholder="Choose a plan" /></SelectTrigger>
            <SelectContent>
              {plans?.length > 0 ? (
                plans.map((p) => <SelectItem key={p._id} value={p._id}>{p.planName} (PKR {p.price})</SelectItem>)
              ) : (
                <SelectItem value="__none__" disabled>No plans found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Frozen">Frozen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-4 flex justify-end gap-2 pt-4 border-t border-stone-100">
          <Button type="button" onClick={() => navigate("/members")}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending || hasErrors}>
            {mutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Save Member
          </Button>
        </div>
      </form>
    </div>
  );
}
