import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getErrClass } from "@/utils/validation";

export default function RoutineForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const defaultMemberId = searchParams.get("memberId") || "";

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [exerciseSchedule, setExerciseSchedule] = useState("");
  const [mealPlan, setMealPlan] = useState("");
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    if (!value || !value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: "This field is required" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

  const { data: memberData } = useQuery({
    queryKey: ["routine-member", id || defaultMemberId],
    queryFn: async () => {
      const res = await API.get(`/members/${id || defaultMemberId}`);
      return res.data.data;
    },
    enabled: !!(id || defaultMemberId),
    staleTime: 0,
    refetchOnMount: "always"
  });

  const { isLoading: loadingRoutine } = useQuery({
    queryKey: ["routine-details", id || defaultMemberId],
    queryFn: async () => {
      const targetId = id || defaultMemberId;
      const res = await API.get(`/routines/${targetId}`);
      const data = res.data.data;
      if (data) {
        setExerciseSchedule(data.exerciseSchedule || "");
        setMealPlan(data.mealPlan || "");
      }
      return data;
    },
    enabled: !!(id || defaultMemberId),
    staleTime: 0,
    refetchOnMount: "always"
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return API.post("/routines", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routine"] });
      toast({ title: "Routine guidelines saved successfully" });
      navigate("/routines");
    },
    onError: (err) => {
      toast({
        title: "Saving failed",
        description: err.response?.data?.message || "Invalid values provided.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      memberId: id || defaultMemberId,
      exerciseSchedule,
      mealPlan
    });
  };

  if (loadingRoutine) {
    return (
      <div className="flex flex-1 items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold font-outfit uppercase">Design Gym Routine</h2>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left Side — Member Details */}
        <div className="flex-1 border border-stone-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-stone-900 font-outfit uppercase border-b border-stone-100 pb-2">Member Details</h3>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between"><span className="text-stone-500">Full Name</span><span className="font-semibold text-stone-900">{memberData?.fullName || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Father's Name</span><span className="font-semibold text-stone-900">{memberData?.fatherName || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Roll Number</span><span className="font-semibold text-stone-900">{memberData?.rollNo || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Cell Number</span><span className="font-semibold text-stone-900">{memberData?.cellNo || "N/A"}</span></div>
            <div className="border-t border-dashed border-stone-100 my-1"></div>
            <div className="flex justify-between"><span className="text-stone-500">Status</span><span className="font-semibold text-stone-900">{memberData?.status || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Monthly Fee</span><span className="font-semibold text-stone-900">PKR {memberData?.monthlyFee || 0}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Joining Date</span><span className="font-semibold text-stone-900">{memberData ? new Date(memberData.joiningDate).toLocaleDateString() : "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Renewal Date</span><span className="font-semibold text-stone-900">{memberData ? new Date(memberData.renewalDate).toLocaleDateString() : "N/A"}</span></div>
          </div>
        </div>

        {/* Right Side — Routine Form */}
        <div className="flex-1 border border-stone-200 rounded-xl p-4 bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="exercises">Exercise Schedule / Splits Description</Label>
              <Textarea
                id="exercises"
                rows={3}
                className={getErrClass(errors, "exerciseSchedule")}
                value={exerciseSchedule}
                onChange={(e) => { setExerciseSchedule(e.target.value); validate("exerciseSchedule", e.target.value); }}
                onBlur={(e) => validate("exerciseSchedule", e.target.value)}
                placeholder="e.g. Chest/Tricpes: Chest Press 4x10, Tricep pushdowns 3x12..."
                required
              />
              {errors.exerciseSchedule && <p className="text-[11px] text-red-500 mt-1">{errors.exerciseSchedule}</p>}
            </div>

            <div>
              <Label htmlFor="meal">Meal & Nutrition Plan Details</Label>
              <Textarea
                id="meal"
                rows={3}
                className={getErrClass(errors, "mealPlan")}
                value={mealPlan}
                onChange={(e) => { setMealPlan(e.target.value); validate("mealPlan", e.target.value); }}
                onBlur={(e) => validate("mealPlan", e.target.value)}
                placeholder="e.g. Breakfast: 4 egg whites + oatmeal. Dinner: 200g grilled chicken..."
                required
              />
              {errors.mealPlan && <p className="text-[11px] text-red-500 mt-1">{errors.mealPlan}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <Button type="button" onClick={() => navigate("/routines")}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending || hasErrors}>Save Guidelines</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
