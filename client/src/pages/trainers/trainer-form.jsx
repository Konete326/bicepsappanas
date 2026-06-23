import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, User, Phone, Mail, CalendarDays, Banknote, BellRing } from "lucide-react";
import { validators, getErrClass } from "@/utils/validation";

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{label}</p>
      <p className="font-semibold text-stone-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function SalaryDueInfo({ joiningDate }) {
  if (!joiningDate) return null;
  const joined = new Date(joiningDate);
  const today = new Date();
  const dueDay = joined.getDate();
  const nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (nextDue < today) nextDue.setMonth(nextDue.getMonth() + 1);
  const diffMs = nextDue - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let badge = "bg-emerald-50 border-emerald-200 text-emerald-700";
  let label = `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  if (diffDays === 0) { badge = "bg-rose-50 border-rose-200 text-rose-700"; label = "Due today!"; }
  else if (diffDays <= 3) { badge = "bg-amber-50 border-amber-200 text-amber-700"; label = `Due in ${diffDays} days`; }

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${badge}`}>
      <BellRing className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-bold">Next Salary Due</p>
        <p className="text-xs mt-0.5">{nextDue.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })} — <span className="font-semibold">{label}</span></p>
      </div>
    </div>
  );
}

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
    joiningDate: ""
  });

  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const rules = {
      fullName: validators.name,
      email: (v) => v ? validators.email(v) : "",
      phone: validators.phone,
      baseSalary: validators.nonNegNum,
    };
    if (rules[field]) {
      setErrors((prev) => ({ ...prev, [field]: rules[field](value) }));
    }
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

  const { data: trainerData, isLoading: loadingTrainer, isError, error } = useQuery({
    queryKey: ["trainer", id],
    queryFn: async () => {
      const res = await API.get(`/trainers/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always"
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error fetching trainer",
        description: "This trainer may have been deleted or there is a network issue.",
        variant: "destructive"
      });
      navigate("/trainers");
    }
  }, [isError, navigate, toast]);

  useEffect(() => {
    if (trainerData) {
      setFormData({
        fullName: trainerData.fullName || "",
        email: trainerData.email || "",
        phone: trainerData.phone || "",
        gender: trainerData.gender || "Male",
        baseSalary: trainerData.baseSalary ?? "",
        joiningDate: trainerData.joiningDate ? trainerData.joiningDate.slice(0, 10) : ""
      });
    }
  }, [trainerData]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (id) return API.put(`/trainers/${id}`, payload);
      return API.post("/trainers", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["trainer", id] });
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
    if (!formData.joiningDate) {
      toast({ title: "Joining date is required", variant: "destructive" });
      return;
    }
    mutation.mutate(formData);
  };

  if (loadingTrainer) {
    return (
      <div className="flex flex-1 items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 pt-2 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate("/trainers")}
          className="w-8 h-8 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center transition-colors shadow-sm"
        >
          <ArrowLeft size={14} className="text-stone-600" />
        </button>
        <h2 className="text-xl font-bold font-outfit uppercase">{id ? "Edit Trainer" : "Register Trainer"}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 rounded-xl p-5 bg-white shadow-sm">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="e.g. Ahmad Khan"
                className={getErrClass(errors, "fullName")}
                value={formData.fullName}
                onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); validate("fullName", e.target.value); }}
                onBlur={(e) => validate("fullName", e.target.value)}
                required
              />
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 03001234567"
                className={getErrClass(errors, "phone")}
                value={formData.phone}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9+]/g, ""); setFormData({ ...formData, phone: v }); validate("phone", v); }}
                onBlur={() => validate("phone", formData.phone)}
                required
              />
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address <span className="text-stone-400 font-normal text-xs">(Optional)</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. ahmad@example.com"
                className={getErrClass(errors, "email")}
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); validate("email", e.target.value); }}
                onBlur={(e) => validate("email", e.target.value)}
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="baseSalary">Base Monthly Salary (PKR)</Label>
              <Input
                id="baseSalary"
                type="number"
                min={0}
                placeholder="Enter base salary"
                className={getErrClass(errors, "baseSalary")}
                value={formData.baseSalary}
                onChange={(e) => { setFormData({ ...formData, baseSalary: e.target.value === "" ? "" : parseInt(e.target.value) }); validate("baseSalary", e.target.value); }}
                onBlur={() => validate("baseSalary", formData.baseSalary)}
                required
              />
              {errors.baseSalary && <p className="text-[11px] text-red-500 mt-1">{errors.baseSalary}</p>}
            </div>

            <div>
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                required
              />
              <p className="text-[11px] text-stone-400 mt-1">Used to schedule monthly salary notifications.</p>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-4 border-t border-stone-100">
              <Button type="button" variant="outline" onClick={() => navigate("/trainers")} className="rounded-full">Cancel</Button>
              <Button type="submit" disabled={mutation.isPending || hasErrors} className="rounded-full">
                {mutation.isPending ? "Saving..." : id ? "Update Trainer" : "Register Trainer"}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          {formData.fullName || formData.phone || formData.baseSalary ? (
            <div className="border border-stone-200 rounded-xl p-6 bg-white shadow-sm sticky top-6 space-y-5">
              <h3 className="font-bold text-stone-800 uppercase text-sm tracking-wider border-b border-stone-100 pb-3">Preview</h3>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-stone-500" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">{formData.fullName || "—"}</p>
                  <p className="text-xs text-stone-400">{formData.gender}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{formData.phone || "No phone"}</span>
                </div>
                {formData.email && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="truncate">{formData.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-stone-600">
                  <CalendarDays className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }) : "No joining date"}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Banknote className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>PKR {formData.baseSalary || "0"} / month</span>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4">
                <SalaryDueInfo joiningDate={formData.joiningDate} />
              </div>
            </div>
          ) : (
            <div className="border border-stone-200 rounded-xl p-6 bg-stone-50 shadow-sm flex flex-col items-center justify-center min-h-[280px] text-center">
              <div className="w-12 h-12 bg-stone-200 rounded-full mb-3 flex items-center justify-center text-stone-400">
                <User className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-600">No Info Yet</p>
              <p className="text-xs text-stone-400 mt-1 max-w-[200px]">Fill in trainer details on the left to see a live preview here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
