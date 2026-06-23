import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Hash, User, Users, Mail, Phone, MapPin,
  CalendarDays, BadgeDollarSign, ShieldCheck, Crown, Venus, Mars
} from "lucide-react";
import { validators, getErrClass } from "@/utils/validation";

/* ── tiny helper ── */
function FieldIcon({ icon: Icon }) {
  return (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
      <Icon size={15} />
    </span>
  );
}

function Field({ label, optional, error, icon, children }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
        {label}
        {optional && <span className="normal-case text-[10px] font-normal text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">optional</span>}
      </Label>
      <div className="relative">
        {icon && <FieldIcon icon={icon} />}
        {children}
      </div>
      {error && <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">⚠ {error}</p>}
    </div>
  );
}

function SectionHeading({ step, title, subtitle }) {
  return (
    <div className="sm:col-span-2 flex items-center gap-3 mt-2">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center">
        {step}
      </span>
      <div>
        <p className="text-sm font-bold text-stone-700">{title}</p>
        {subtitle && <p className="text-xs text-stone-400">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-stone-100 ml-2" />
    </div>
  );
}

const inputClass = (icon) =>
  `h-9 text-sm border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-300 rounded-lg transition-all ${icon ? "pl-8" : ""}`;

export default function MemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    rollNo: "",
    fullName: "",
    fatherName: "",
    email: "",
    cellNo: "+92",
    address: "",
    joiningDate: new Date().toISOString().split("T")[0],
    renewalDate: new Date().toISOString().split("T")[0],
    status: "Active",
    monthlyFee: "",
    memberType: "Basic",
    gender: "Male"
  });

  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const rules = {
      fullName: validators.name,
      fatherName: validators.name,
      email: validators.email,
      cellNo: validators.phone,
      address: validators.textOptional,
    };
    if (rules[field]) {
      setErrors((prev) => ({ ...prev, [field]: rules[field](value) }));
    }
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

  const { data: nextRollNo } = useQuery({
    queryKey: ["nextRollNo"],
    queryFn: async () => {
      const res = await API.get("/members/next-roll-no");
      return res.data.data;
    },
    enabled: !id
  });

  useEffect(() => {
    if (!id) {
      setFormData((prev) => ({ ...prev, rollNo: nextRollNo || "0001" }));
    }
  }, [nextRollNo, id]);

  const { data: memberData, isLoading: loadingMember } = useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const res = await API.get(`/members/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always"
  });

  useEffect(() => {
    if (memberData) {
      setFormData({
        rollNo: memberData.rollNo || "",
        fullName: memberData.fullName || "",
        fatherName: memberData.fatherName || "",
        email: memberData.email || "",
        cellNo: memberData.cellNo || "+92",
        address: memberData.address || "",
        joiningDate: new Date(memberData.joiningDate).toISOString().split("T")[0],
        renewalDate: new Date(memberData.renewalDate).toISOString().split("T")[0],
        status: memberData.status || "Active",
        monthlyFee: memberData.monthlyFee ?? "",
        memberType: memberData.memberType || "Basic",
        gender: memberData.gender || "Male"
      });
    }
  }, [memberData]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (id) return API.put(`/members/${id}`, payload);
      return API.post("/members", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
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
    const payload = {
      ...formData,
      email: formData.email.trim() === "" ? undefined : formData.email,
      address: formData.address.trim() === "" ? "N/A" : formData.address,
      renewalDate: formData.joiningDate
    };
    mutation.mutate(payload);
  };

  const set = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    validate(field, value);
  };

  if (loadingMember) {
    return (
      <div className="flex justify-center items-center p-16">
        <Loader2 className="animate-spin text-stone-400 w-6 h-6" />
      </div>
    );
  }

  /* ── status colour map ── */
  const statusColors = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Expired: "bg-red-50 text-red-600 border-red-200",
    Frozen: "bg-blue-50 text-blue-600 border-blue-200",
  };

  const memberTypeColors = {
    Basic: "bg-stone-50 text-stone-600 border-stone-200",
    Special: "bg-purple-50 text-purple-700 border-purple-200",
    VIP: "bg-amber-50 text-amber-700 border-amber-200",
    Premium: "bg-orange-50 text-orange-700 border-orange-200",
    Cardio: "bg-pink-50 text-pink-700 border-pink-200",
    CrossFit: "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Personal Training": "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <div className="p-6 w-full">
      <form onSubmit={handleSubmit}>

        {/* ══════════════════════════════
            TWO-COLUMN ROW: Left + Right
        ══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* ── LEFT — Personal Information ── */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
              <User size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Personal Information</span>
              {/* Roll No badge */}
              <div className="ml-auto flex items-center gap-1.5 bg-white border border-stone-200 rounded-md px-2.5 py-1">
                <Hash size={12} className="text-stone-400" />
                <span className="text-xs font-mono font-bold text-stone-600">{formData.rollNo || "—"}</span>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">

              {/* Full Name + Father's Name — same row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" error={errors.fullName} icon={User}>
                  <Input
                    id="fullName"
                    placeholder="e.g. Muhammad Ali"
                    className={inputClass(true) + " " + getErrClass(errors, "fullName")}
                    value={formData.fullName}
                    onChange={set("fullName")}
                    onBlur={(e) => validate("fullName", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Father's Name" error={errors.fatherName} icon={Users}>
                  <Input
                    id="fatherName"
                    placeholder="e.g. Muhammad Ahmed"
                    className={inputClass(true) + " " + getErrClass(errors, "fatherName")}
                    value={formData.fatherName}
                    onChange={set("fatherName")}
                    onBlur={(e) => validate("fatherName", e.target.value)}
                    required
                  />
                </Field>
              </div>

              {/* Gender toggle */}
              <Field label="Gender">
                <div className="flex gap-2">
                  {["Male", "Female", "Other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        formData.gender === g
                          ? "bg-stone-800 text-white border-stone-800"
                          : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {g === "Male" ? "♂ Male" : g === "Female" ? "♀ Female" : "⊕ Other"}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Cell Number + Email — same row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cell Number" error={errors.cellNo} icon={Phone}>
                  <Input
                    id="cellNo"
                    type="tel"
                    className={inputClass(true) + " " + getErrClass(errors, "cellNo")}
                    value={formData.cellNo}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9+]/g, "");
                      setFormData((prev) => ({ ...prev, cellNo: v }));
                      validate("cellNo", v);
                    }}
                    onBlur={() => validate("cellNo", formData.cellNo)}
                    placeholder="+923001234567"
                    required
                  />
                </Field>

                <Field label="Email Address" optional error={errors.email} icon={Mail}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. ali@example.com"
                    className={inputClass(true) + " " + getErrClass(errors, "email")}
                    value={formData.email}
                    onChange={set("email")}
                    onBlur={(e) => validate("email", e.target.value)}
                  />
                </Field>
              </div>

              {/* Address — full width */}
              <Field label="Address" optional error={errors.address} icon={MapPin}>
                <Input
                  id="address"
                  placeholder="e.g. House 12, Street 5, Lahore"
                  className={inputClass(true) + " " + getErrClass(errors, "address")}
                  value={formData.address}
                  onChange={set("address")}
                  onBlur={(e) => validate("address", e.target.value)}
                />
              </Field>

            </div>
          </div>

          {/* ── RIGHT — Membership Details ── */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
              <Crown size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Membership Details</span>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">

              {/* Joining Date + Monthly Fee — same row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Joining Date" icon={CalendarDays}>
                  <Input
                    id="joiningDate"
                    type="date"
                    className={inputClass(true)}
                    value={formData.joiningDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData((prev) => ({ ...prev, joiningDate: newDate, renewalDate: newDate }));
                    }}
                    required
                  />
                </Field>

                <Field label="Monthly Fee (PKR)" icon={BadgeDollarSign}>
                  <Input
                    id="monthlyFee"
                    type="number"
                    min={0}
                    placeholder="e.g. 3000"
                    className={inputClass(true)}
                    value={formData.monthlyFee}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, monthlyFee: e.target.value === "" ? "" : parseInt(e.target.value) }))
                    }
                    required
                  />
                </Field>
              </div>

              {/* Membership Type + Status — same row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Membership Type" icon={Crown}>
                  <Select value={formData.memberType} onValueChange={(val) => setFormData((prev) => ({ ...prev, memberType: val }))}>
                    <SelectTrigger id="memberType" className={`h-9 text-sm pl-8 border-stone-200 rounded-lg ${memberTypeColors[formData.memberType] || ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Basic", "Special", "VIP", "Premium", "Cardio", "CrossFit", "Personal Training"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Status" icon={ShieldCheck}>
                  <Select value={formData.status} onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}>
                    <SelectTrigger className={`h-9 text-sm pl-8 border rounded-lg ${statusColors[formData.status] || ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">🟢 Active</SelectItem>
                      <SelectItem value="Expired">🔴 Expired</SelectItem>
                      <SelectItem value="Frozen">🔵 Frozen</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

            </div>
          </div>

        </div>{/* end two-col grid */}

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/members")}
            className="text-sm rounded-lg border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white transition-all"
          >
            ← Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || hasErrors}
            className="text-sm rounded-lg bg-stone-800 hover:bg-stone-700 text-white px-6 gap-2"
          >
            {mutation.isPending && <Loader2 className="animate-spin h-4 w-4" />}
            {id ? "Update Member" : "Register Member"}
          </Button>
        </div>

      </form>
    </div>
  );
}
