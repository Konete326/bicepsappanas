import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function RoutineForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const defaultMemberId = searchParams.get("memberId") || "";

  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exerciseSchedule, setExerciseSchedule] = useState("");
  const [mealPlan, setMealPlan] = useState("");

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
    enabled: !!(id || defaultMemberId)
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return API.post("/routines", payload);
    },
    onSuccess: () => {
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
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 font-outfit uppercase">Design Gym Routine</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="sm:col-span-2">
          <Label htmlFor="exercises">Exercise Schedule / Splits Description</Label>
          <Textarea
            id="exercises"
            rows={5}
            value={exerciseSchedule}
            onChange={(e) => setExerciseSchedule(e.target.value)}
            placeholder="e.g. Chest/Tricpes: Chest Press 4x10, Tricep pushdowns 3x12..."
            required
          />
        </div>

        <div>
          <Label htmlFor="meal">Meal & Nutrition Plan Details</Label>
          <Textarea
            id="meal"
            rows={5}
            value={mealPlan}
            onChange={(e) => setMealPlan(e.target.value)}
            placeholder="e.g. Breakfast: 4 egg whites + oatmeal. Dinner: 200g grilled chicken..."
            required
          />
        </div>

        <div className="sm:col-span-2 flex justify-end gap-2 pt-4 border-t border-stone-100">
          <Button type="button" onClick={() => navigate("/routines")}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>Save Guidelines</Button>
        </div>
      </form>
    </div>
  );
}
