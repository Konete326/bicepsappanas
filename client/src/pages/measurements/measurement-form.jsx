import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { validators, getErrClass } from "@/utils/validation";

export default function MeasurementForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultMemberId = searchParams.get("memberId") || "";

  const [memberId, setMemberId] = useState(defaultMemberId);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bicep, setBicep] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [legs, setLegs] = useState("");
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

  const getBmiCategory = () => {
    const w = parseFloat(weight);
    const hFt = parseFloat(height);
    const a = parseInt(age);
    if (!w || !hFt) return { category: "N/A", bmi: 0, tips: "" };

    const hM = hFt * 0.3048;
    const bmi = +(w / (hM * hM)).toFixed(1);

    // Age-specific BMI thresholds
    if (a > 0 && a < 18) {
      // Teen BMI-for-age simplified cut-points (WHO reference)
      let uw, ow;
      if (a < 10) { uw = 15; ow = 18.5; }
      else if (a < 15) { uw = 15.5; ow = 20; }
      else { uw = 16.5; ow = 22; }

      if (bmi < uw) return { category: "Underweight", bmi, tips: "Focus on calorie-dense meals and strength training for healthy weight gain." };
      if (bmi >= ow) return { category: "Overweight", bmi, tips: "Increase cardio activity and balance diet with lean protein and vegetables." };
      return { category: "Normal", bmi, tips: "Great shape! Maintain active lifestyle and balanced nutrition for growth." };
    }

    // Adult BMI (18+)
    if (bmi < 18.5) return { category: "Underweight", bmi, tips: "Optimize with high-protein and high-calorie nutrition." };
    if (bmi >= 25 && bmi < 30) return { category: "Overweight", bmi, tips: "Routine recommendation: Maximize cardio and daily sets." };
    if (bmi >= 30) return { category: "Obese", bmi, tips: "Prioritize daily cardio, strength training and strict calorie control." };
    return { category: "Normal", bmi, tips: "Maintain active lifestyle and balance calories." };
  };

  const bmiDetails = getBmiCategory();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/measurements", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements-history"] });
      toast({ title: "Measurements logged successfully" });
      navigate("/measurements");
    },
    onError: (err) => {
      toast({
        title: "Logging failed",
        description: err.response?.data?.message || "Invalid values provided.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memberId) {
      toast({ title: "Select a member", variant: "destructive" });
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
      bmiCategory: bmiDetails.category
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 font-outfit uppercase">Log Body Measurements</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-stone-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="sm:col-span-2">
          <Label htmlFor="memberSelect">Select Member</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger id="memberSelect"><SelectValue placeholder="Choose member" /></SelectTrigger>
            <SelectContent>
              {members?.length > 0 ? (
                members.map((m) => <SelectItem key={m._id} value={m._id}>{m.fullName} ({m.rollNo})</SelectItem>)
              ) : (
                <SelectItem value="__none__" disabled>No members found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="age">Age</Label><Input id="age" type="number" placeholder="Enter age" className={getErrClass(errors, "age")} value={age} onChange={(e) => { setAge(e.target.value); validate("age", e.target.value); }} onBlur={(e) => validate("age", e.target.value)} required />{errors.age && <p className="text-[11px] text-red-500 mt-1">{errors.age}</p>}</div>

        <div><Label htmlFor="height">Height (Feet.Inches)</Label><Input id="height" placeholder="e.g. 5.7" className={getErrClass(errors, "height")} value={height} onChange={(e) => { setHeight(e.target.value); validate("height", e.target.value); }} onBlur={(e) => validate("height", e.target.value)} required />{errors.height && <p className="text-[11px] text-red-500 mt-1">{errors.height}</p>}</div>
        <div><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" type="number" step="0.1" placeholder="e.g. 70.5" className={getErrClass(errors, "weight")} value={weight} onChange={(e) => { setWeight(e.target.value); validate("weight", e.target.value); }} onBlur={(e) => validate("weight", e.target.value)} required />{errors.weight && <p className="text-[11px] text-red-500 mt-1">{errors.weight}</p>}</div>
        <div><Label htmlFor="bicep">Bicep Size (inches)</Label><Input id="bicep" type="number" step="0.1" placeholder="e.g. 14.5" className={getErrClass(errors, "bicep")} value={bicep} onChange={(e) => { setBicep(e.target.value); validate("bicep", e.target.value); }} onBlur={(e) => validate("bicep", e.target.value)} required />{errors.bicep && <p className="text-[11px] text-red-500 mt-1">{errors.bicep}</p>}</div>
        <div><Label htmlFor="chest">Chest Size (inches)</Label><Input id="chest" type="number" step="0.1" placeholder="e.g. 40" className={getErrClass(errors, "chest")} value={chest} onChange={(e) => { setChest(e.target.value); validate("chest", e.target.value); }} onBlur={(e) => validate("chest", e.target.value)} required />{errors.chest && <p className="text-[11px] text-red-500 mt-1">{errors.chest}</p>}</div>
        <div><Label htmlFor="waist">Waist Size (inches)</Label><Input id="waist" type="number" step="0.1" placeholder="e.g. 32" className={getErrClass(errors, "waist")} value={waist} onChange={(e) => { setWaist(e.target.value); validate("waist", e.target.value); }} onBlur={(e) => validate("waist", e.target.value)} required />{errors.waist && <p className="text-[11px] text-red-500 mt-1">{errors.waist}</p>}</div>
        <div><Label htmlFor="legs">Thighs / Legs (inches)</Label><Input id="legs" type="number" step="0.1" placeholder="e.g. 22" className={getErrClass(errors, "legs")} value={legs} onChange={(e) => { setLegs(e.target.value); validate("legs", e.target.value); }} onBlur={(e) => validate("legs", e.target.value)} required />{errors.legs && <p className="text-[11px] text-red-500 mt-1">{errors.legs}</p>}</div>

        {weight && height && age && (
          <div className="sm:col-span-3 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
            <p><strong>BMI:</strong> {bmiDetails.bmi} &mdash; <strong>Category:</strong> {bmiDetails.category}</p>
            <p className="text-stone-600 font-semibold">{bmiDetails.tips}</p>
          </div>
        )}

        <div className="sm:col-span-3 flex justify-end gap-2 pt-4 border-t border-stone-100">
          <Button type="button" onClick={() => navigate("/measurements")}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending || hasErrors}>Save Stats</Button>
        </div>
      </form>
    </div>
  );
}
