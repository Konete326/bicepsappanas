import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Activity, Scale, Ruler, Dumbbell, CalendarDays, HeartPulse, Check, ChevronsUpDown } from "lucide-react";
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

const inputClass = (icon) =>
  `h-9 text-sm border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-300 rounded-lg transition-all ${icon ? "pl-8" : ""}`;

export default function MeasurementForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultMemberId = searchParams.get("memberId") || "";

  const [openMemberSelect, setOpenMemberSelect] = useState(false);
  const [memberId, setMemberId] = useState(defaultMemberId);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bicep, setBicep] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [legs, setLegs] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [calf, setCalf] = useState("");
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const rules = {
      age: validators.age,
      height: validators.height,
      weight: validators.measurement,
      bicep: validators.measurement,
      chest: validators.measurement,
      waist: validators.measurement,
      legs: validators.measurement,
      shoulder: validators.measurement,
      calf: validators.measurement,
    };
    if (rules[field]) setErrors((prev) => ({ ...prev, [field]: rules[field](value) }));
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["members-lookup-measure"],
    queryFn: async () => {
      const res = await API.get("/members");
      return res.data.data || [];
    }
  });

  const getBodyStats = () => {
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (!w || !height || !a || !memberId) return null;

    const hParts = String(height).split('.');
    const feet = parseInt(hParts[0]) || 0;
    const inches = hParts[1] ? parseInt(hParts[1]) : 0;
    const totalInches = (feet * 12) + inches;
    if (totalInches <= 0) return null;

    const heightCm = totalInches * 2.54;
    const heightM = heightCm / 100;
    const bmi = +(w / (heightM * heightM)).toFixed(1);

    const selectedMember = members?.find(m => m._id === memberId);
    const gender = selectedMember?.gender || "Male";
    const sexConst = gender.toLowerCase() === "female" ? 0 : 1;

    // BFP (Body Fat Percentage using Deurenberg formula)
    let bfp = 0;
    if (a < 18) {
      bfp = (1.51 * bmi) - (0.70 * a) - (3.6 * sexConst) + 1.4;
    } else {
      bfp = (1.20 * bmi) + (0.23 * a) - (10.8 * sexConst) - 5.4;
    }
    bfp = Math.max(2, +bfp.toFixed(1)); // Cap minimum at 2%

    // BMR (Basal Metabolic Rate using Mifflin-St Jeor)
    let bmr = (10 * w) + (6.25 * heightCm) - (5 * a);
    bmr = gender.toLowerCase() === "female" ? bmr - 161 : bmr + 5;
    bmr = Math.round(bmr);

    let category = "Normal";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obese";

    return { bmi, category, bfp, bmr };
  };

  const bodyStats = getBodyStats();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/measurements", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements-history"] });
      toast({ title: "Measurements saved" });
      navigate("/measurements");
    },
    onError: (err) => {
      toast({
        title: "Error saving",
        description: err.response?.data?.message || "Invalid values provided.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memberId) {
      toast({ title: "Please choose a member", variant: "destructive" });
      return;
    }
    mutation.mutate({
      memberId,
      age: parseInt(age) || 0,
      heightFeetInches: height,
      weight: parseFloat(weight) || 0,
      bicep: parseFloat(bicep) || 0,
      chest: parseFloat(chest) || 0,
      waist: parseFloat(waist) || 0,
      leg: parseFloat(legs) || 0,
      shoulder: parseFloat(shoulder) || 0,
      calf: parseFloat(calf) || 0,
      bmiCategory: bodyStats?.category || "Normal"
    });
  };

  if (loadingMembers) {
    return (
      <div className="flex justify-center items-center p-16">
        <Loader2 className="animate-spin text-stone-400 w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <form onSubmit={handleSubmit}>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          
          {/* ── LEFT — Basic Info ── */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
              <User size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Basic Details</span>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">

              <Field label="Choose Member" icon={User}>
                <Popover open={openMemberSelect} onOpenChange={setOpenMemberSelect}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMemberSelect}
                      className={`w-full justify-between font-normal h-9 text-sm pl-8 border-stone-200 rounded-lg ${!memberId ? "text-stone-500" : "text-stone-900"}`}
                    >
                      {memberId && members?.length > 0
                        ? (() => {
                            const selected = members.find((m) => m._id === memberId);
                            return selected ? `${selected.fullName} (${selected.rollNo})` : "Select a member...";
                          })()
                        : "Select a member..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search member by name or roll no..." />
                      <CommandList>
                        <CommandEmpty>No member found.</CommandEmpty>
                        <CommandGroup>
                          {members?.map((m) => (
                            <CommandItem
                              key={m._id}
                              value={`${m.fullName} ${m.rollNo} ${m._id}`}
                              onSelect={() => {
                                setMemberId(m._id);
                                setOpenMemberSelect(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  memberId === m._id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {m.fullName} ({m.rollNo})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Age" error={errors.age} icon={CalendarDays}>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g. 25"
                    className={inputClass(true) + " " + getErrClass(errors, "age")}
                    value={age}
                    onChange={(e) => { setAge(e.target.value); validate("age", e.target.value); }}
                    onBlur={(e) => validate("age", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Height (ft.in)" error={errors.height} icon={Ruler}>
                  <Input
                    id="height"
                    placeholder="e.g. 5.7"
                    className={inputClass(true) + " " + getErrClass(errors, "height")}
                    value={height}
                    onChange={(e) => { setHeight(e.target.value); validate("height", e.target.value); }}
                    onBlur={(e) => validate("height", e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Weight (kg)" error={errors.weight} icon={Scale}>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 70.5"
                    className={inputClass(true) + " " + getErrClass(errors, "weight")}
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); validate("weight", e.target.value); }}
                    onBlur={(e) => validate("weight", e.target.value)}
                    required
                  />
                </Field>
                <div className="flex flex-col justify-end">
                    {bodyStats && (
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                          <Activity size={12} className={
                            bodyStats.category === 'Normal' ? 'text-emerald-500' :
                            bodyStats.category === 'Underweight' ? 'text-amber-500' : 'text-rose-500'
                          }/> 
                          BMI: {bodyStats.bmi} ({bodyStats.category})
                        </div>
                        <div className="flex items-center justify-between text-stone-600">
                          <span><strong>BFP:</strong> ~{bodyStats.bfp}%</span>
                          <span><strong>BMR:</strong> {bodyStats.bmr} kcal</span>
                        </div>
                      </div>
                    )}
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT — Body Measurements ── */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
              <Dumbbell size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Body Stats</span>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">

              <div className="grid grid-cols-2 gap-3">
                <Field label="Bicep (in)" error={errors.bicep} icon={Activity}>
                  <Input
                    id="bicep"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14.5"
                    className={inputClass(true) + " " + getErrClass(errors, "bicep")}
                    value={bicep}
                    onChange={(e) => { setBicep(e.target.value); validate("bicep", e.target.value); }}
                    onBlur={(e) => validate("bicep", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Chest (in)" error={errors.chest} icon={HeartPulse}>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 40"
                    className={inputClass(true) + " " + getErrClass(errors, "chest")}
                    value={chest}
                    onChange={(e) => { setChest(e.target.value); validate("chest", e.target.value); }}
                    onBlur={(e) => validate("chest", e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Waist (in)" error={errors.waist} icon={Activity}>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 32"
                    className={inputClass(true) + " " + getErrClass(errors, "waist")}
                    value={waist}
                    onChange={(e) => { setWaist(e.target.value); validate("waist", e.target.value); }}
                    onBlur={(e) => validate("waist", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Legs (in)" error={errors.legs} icon={Activity}>
                  <Input
                    id="legs"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 22"
                    className={inputClass(true) + " " + getErrClass(errors, "legs")}
                    value={legs}
                    onChange={(e) => { setLegs(e.target.value); validate("legs", e.target.value); }}
                    onBlur={(e) => validate("legs", e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Shoulder (in)" error={errors.shoulder} icon={Activity}>
                  <Input
                    id="shoulder"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 45"
                    className={inputClass(true) + " " + getErrClass(errors, "shoulder")}
                    value={shoulder}
                    onChange={(e) => { setShoulder(e.target.value); validate("shoulder", e.target.value); }}
                    onBlur={(e) => validate("shoulder", e.target.value)}
                    required
                  />
                </Field>

                <Field label="Calves (in)" error={errors.calf} icon={Activity}>
                  <Input
                    id="calf"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15"
                    className={inputClass(true) + " " + getErrClass(errors, "calf")}
                    value={calf}
                    onChange={(e) => { setCalf(e.target.value); validate("calf", e.target.value); }}
                    onBlur={(e) => validate("calf", e.target.value)}
                    required
                  />
                </Field>
              </div>

            </div>
          </div>

        </div>

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/measurements")}
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
            Save Stats
          </Button>
        </div>

      </form>
    </div>
  );
}

