import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function MeasurementForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    if (!w || !hFt) return { category: "N/A", tips: "" };

    const hM = hFt * 0.3048;
    const bmi = w / (hM * hM);

    if (bmi < 18.5) {
      return { category: "Underweight", tips: "Optimize with high-protein and high-calorie nutrition." };
    } else if (bmi >= 25.0) {
      return { category: "Overweight", tips: "Routine recommendation: Maximize cardio and daily sets." };
    }
    return { category: "Normal", tips: "Maintain active lifestyle and balance calories." };
  };

  const bmiDetails = getBmiCategory();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/measurements", payload);
      return res.data;
    },
    onSuccess: () => {
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
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 border border-stone-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="sm:col-span-4">
          <Label htmlFor="memberSelect">Select Member</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger id="memberSelect"><SelectValue placeholder="Choose member" /></SelectTrigger>
            <SelectContent>
              {members?.map((m) => <SelectItem key={m._id} value={m._id}>{m.fullName} ({m.rollNo})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div><Label htmlFor="age">Age</Label><Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required /></div>
        <div><Label htmlFor="height">Height (Feet.Inches)</Label><Input id="height" placeholder="e.g. 5.7" value={height} onChange={(e) => setHeight(e.target.value)} required /></div>
        <div><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required /></div>
        <div><Label htmlFor="bicep">Bicep Size (inches)</Label><Input id="bicep" type="number" step="0.1" value={bicep} onChange={(e) => setBicep(e.target.value)} required /></div>
        <div><Label htmlFor="chest">Chest Size (inches)</Label><Input id="chest" type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} required /></div>
        <div><Label htmlFor="waist">Waist Size (inches)</Label><Input id="waist" type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} required /></div>
        <div><Label htmlFor="legs">Thighs / Legs (inches)</Label><Input id="legs" type="number" step="0.1" value={legs} onChange={(e) => setLegs(e.target.value)} required /></div>

        {weight && height && (
          <div className="sm:col-span-4 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
            <p><strong>Calculated BMI Category:</strong> {bmiDetails.category}</p>
            <p className="text-stone-600 font-semibold">{bmiDetails.tips}</p>
          </div>
        )}

        <div className="sm:col-span-4 flex justify-end gap-2 pt-4 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={() => navigate("/measurements")}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>Save Stats</Button>
        </div>
      </form>
    </div>
  );
}
