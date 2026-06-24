import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, User, Plus, Trash2, Dumbbell, Clipboard, X } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Snack", "Dinner"];

function emptyDay() {
  return { day: "", exercises: [""], sets: "", reps: "" };
}

function emptyMeal() {
  return { mealType: "", items: [""], calories: "", protein: "" };
}

export default function RoutineForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [exerciseSchedule, setExerciseSchedule] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);

  const { data: memberData } = useQuery({
    queryKey: ["routine-member", id],
    queryFn: async () => {
      const res = await API.get(`/members/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const { isLoading: loadingRoutine } = useQuery({
    queryKey: ["routine-details", id],
    queryFn: async () => {
      const res = await API.get(`/routines/${id}`);
      const data = res.data.data;
      if (data) {
        const parsedExercises = Array.isArray(data.exerciseSchedule)
          ? data.exerciseSchedule.map((e) => ({
              day: e.day || "",
              exercises: e.exercises?.length ? e.exercises : [""],
              sets: e.sets?.toString() || "",
              reps: e.reps?.toString() || "",
            }))
          : [];
        const parsedMeals = Array.isArray(data.mealPlan)
          ? data.mealPlan.map((m) => ({
              mealType: m.mealType || "",
              items: m.items?.length ? m.items : [""],
              calories: m.calories?.toString() || "",
              protein: m.protein?.toString() || "",
            }))
          : [];
        setExerciseSchedule(parsedExercises);
        setMealPlan(parsedMeals);
      }
      return data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const mutation = useMutation({
    mutationFn: async (payload) => API.post("/routines", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines-all"] });
      queryClient.invalidateQueries({ queryKey: ["routine-details"] });
      toast({ title: "Routine guidelines saved successfully" });
      navigate("/routines");
    },
    onError: (err) => {
      toast({ title: "Saving failed", description: err.response?.data?.message || "Invalid values provided.", variant: "destructive" });
    },
  });

  const addExerciseDay = () => setExerciseSchedule((prev) => [...prev, emptyDay()]);
  const removeExerciseDay = (idx) => setExerciseSchedule((prev) => prev.filter((_, i) => i !== idx));
  const updateExerciseDay = (idx, field, value) => {
    setExerciseSchedule((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };
  const updateExerciseItem = (dayIdx, exIdx, value) => {
    setExerciseSchedule((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, exercises: d.exercises.map((ex, j) => (j === exIdx ? value : ex)) } : d))
    );
  };
  const addExerciseItem = (dayIdx) => {
    setExerciseSchedule((prev) => prev.map((d, i) => (i === dayIdx ? { ...d, exercises: [...d.exercises, ""] } : d)));
  };
  const removeExerciseItem = (dayIdx, exIdx) => {
    setExerciseSchedule((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) } : d))
    );
  };

  const addMeal = () => setMealPlan((prev) => [...prev, emptyMeal()]);
  const removeMeal = (idx) => setMealPlan((prev) => prev.filter((_, i) => i !== idx));
  const updateMeal = (idx, field, value) => {
    setMealPlan((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };
  const updateMealItem = (mealIdx, itemIdx, value) => {
    setMealPlan((prev) =>
      prev.map((m, i) => (i === mealIdx ? { ...m, items: m.items.map((it, j) => (j === itemIdx ? value : it)) } : m))
    );
  };
  const addMealItem = (mealIdx) => {
    setMealPlan((prev) => prev.map((m, i) => (i === mealIdx ? { ...m, items: [...m.items, ""] } : m)));
  };
  const removeMealItem = (mealIdx, itemIdx) => {
    setMealPlan((prev) =>
      prev.map((m, i) => (i === mealIdx ? { ...m, items: m.items.filter((_, j) => j !== itemIdx) } : m))
    );
  };

  const isDayValid = (d) => d.day && d.exercises.some((ex) => ex.trim());
  const isMealValid = (m) => m.mealType && m.items.some((it) => it.trim());

  const hasValidData = useMemo(() => {
    const validDays = exerciseSchedule.some(isDayValid);
    const validMeals = mealPlan.some(isMealValid);
    return validDays || validMeals;
  }, [exerciseSchedule, mealPlan]);

  const isDayIncomplete = (d) => {
    if (!d.day && d.exercises.some((ex) => ex.trim())) return true;
    if (d.day && !d.exercises.some((ex) => ex.trim())) return true;
    return false;
  };

  const isMealIncomplete = (m) => {
    if (!m.mealType && m.items.some((it) => it.trim())) return true;
    if (m.mealType && !m.items.some((it) => it.trim())) return true;
    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasValidData) {
      toast({ title: "Add at least one exercise day or meal", variant: "destructive" });
      return;
    }
    const payload = {
      memberId: id,
      exerciseSchedule: exerciseSchedule
        .filter((d) => d.day && d.exercises.some((ex) => ex.trim()))
        .map((d) => ({
          day: d.day,
          exercises: d.exercises.filter((ex) => ex.trim()),
          sets: parseInt(d.sets) || undefined,
          reps: parseInt(d.reps) || undefined,
        })),
      mealPlan: mealPlan
        .filter((m) => m.mealType && m.items.some((it) => it.trim()))
        .map((m) => ({
          mealType: m.mealType,
          items: m.items.filter((it) => it.trim()),
          calories: parseFloat(m.calories) || undefined,
          protein: parseFloat(m.protein) || undefined,
        })),
    };
    mutation.mutate(payload);
  };

  if (loadingRoutine) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="animate-spin text-stone-400 h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="text-stone-500 rounded-lg" onClick={() => navigate("/routines")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="h-6 w-px bg-stone-200" />
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
            <User size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-stone-900 font-outfit uppercase truncate">
              {memberData?.fullName || "Unknown Member"}
            </h2>
            <div className="flex items-center gap-2.5 text-[11px] text-stone-500">
              <span>Roll: <span className="font-semibold text-stone-700">{memberData?.rollNo || "-"}</span></span>
              <span>Status: <span className="font-semibold text-stone-700">{memberData?.status || "-"}</span></span>
            </div>
          </div>
        </div>
        <div className="flex-1" />
        <Button type="submit" form="routine-form" disabled={mutation.isPending || !hasValidData} className="rounded-lg">
          {mutation.isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
          Save Routine
        </Button>
      </div>

      <form id="routine-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border border-stone-200 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Dumbbell size={14} className="text-stone-500" />
              <CardTitle className="text-sm font-semibold">Workout Schedule</CardTitle>
            </div>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={addExerciseDay}>
              <Plus className="mr-1 h-3 w-3" /> Add Day
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4 flex-1">
            {exerciseSchedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400 text-xs">
                <Dumbbell size={24} className="mb-2 opacity-30" />
                <p>No workout days added yet</p>
                <Button type="button" variant="ghost" size="sm" className="mt-2 text-xs" onClick={addExerciseDay}>
                  <Plus className="mr-1 h-3 w-3" /> Add First Day
                </Button>
              </div>
            ) : (
              exerciseSchedule.map((dayEntry, dayIdx) => {
                const incomplete = isDayIncomplete(dayEntry);
                return (
                <div key={dayIdx} className={`border rounded-lg p-3 space-y-2.5 ${incomplete ? "border-amber-300 bg-amber-50/30" : "border-stone-200 bg-stone-50/50"}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="text-[10px] font-semibold text-stone-500 uppercase flex items-center gap-1 mb-1">Day</Label>
                      <Select value={dayEntry.day} onValueChange={(v) => updateExerciseDay(dayIdx, "day", v)}>
                        <SelectTrigger className={`h-8 text-xs rounded-lg ${!dayEntry.day && incomplete ? "border-amber-400" : ""}`}><SelectValue placeholder="Select day" /></SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Label className="text-[10px] font-semibold text-stone-500 uppercase flex items-center gap-1 mb-1">Sets <span className="normal-case text-[9px] font-normal text-stone-400">opt</span></Label>
                      <Input placeholder="Sets" type="number" className="h-8 text-xs rounded-lg" value={dayEntry.sets} onChange={(e) => updateExerciseDay(dayIdx, "sets", e.target.value)} />
                    </div>
                    <div className="w-20">
                      <Label className="text-[10px] font-semibold text-stone-500 uppercase flex items-center gap-1 mb-1">Reps <span className="normal-case text-[9px] font-normal text-stone-400">opt</span></Label>
                      <Input placeholder="Reps" type="number" className="h-8 text-xs rounded-lg" value={dayEntry.reps} onChange={(e) => updateExerciseDay(dayIdx, "reps", e.target.value)} />
                    </div>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-rose-500 shrink-0" onClick={() => removeExerciseDay(dayIdx)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                  {incomplete && <p className="text-[10px] text-amber-600">Select a day and add at least one exercise</p>}
                  <div className="space-y-1.5">
                    {dayEntry.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="flex items-center gap-1.5">
                        <Input
                          placeholder={`Exercise ${exIdx + 1}, e.g. Bench Press 4x10`}
                          className="h-7 text-xs rounded-lg"
                          value={ex}
                          onChange={(e) => updateExerciseItem(dayIdx, exIdx, e.target.value)}
                        />
                        {dayEntry.exercises.length > 1 && (
                          <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-stone-300 hover:text-rose-500 shrink-0" onClick={() => removeExerciseItem(dayIdx, exIdx)}>
                            <X size={10} />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px] text-stone-500" onClick={() => addExerciseItem(dayIdx)}>
                      <Plus className="mr-1 h-2.5 w-2.5" /> Add Exercise
                    </Button>
                  </div>
                </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border border-stone-200 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Clipboard size={14} className="text-stone-500" />
              <CardTitle className="text-sm font-semibold">Meal & Nutrition Plan</CardTitle>
            </div>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={addMeal}>
              <Plus className="mr-1 h-3 w-3" /> Add Meal
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4 flex-1">
            {mealPlan.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400 text-xs">
                <Clipboard size={24} className="mb-2 opacity-30" />
                <p>No meals added yet</p>
                <Button type="button" variant="ghost" size="sm" className="mt-2 text-xs" onClick={addMeal}>
                  <Plus className="mr-1 h-3 w-3" /> Add First Meal
                </Button>
              </div>
            ) : (
              mealPlan.map((meal, mealIdx) => {
                const incomplete = isMealIncomplete(meal);
                return (
                <div key={mealIdx} className={`border rounded-lg p-3 space-y-2.5 ${incomplete ? "border-amber-300 bg-amber-50/30" : "border-stone-200 bg-stone-50/50"}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="text-[10px] font-semibold text-stone-500 uppercase flex items-center gap-1 mb-1">Meal Type</Label>
                      <Select value={meal.mealType} onValueChange={(v) => updateMeal(mealIdx, "mealType", v)}>
                        <SelectTrigger className={`h-8 text-xs rounded-lg ${!meal.mealType && incomplete ? "border-amber-400" : ""}`}><SelectValue placeholder="Select meal type" /></SelectTrigger>
                        <SelectContent>
                          {MEAL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Label className="text-[10px] font-semibold text-stone-500 uppercase flex items-center gap-1 mb-1">Cal <span className="normal-case text-[9px] font-normal text-stone-400">opt</span></Label>
                      <Input placeholder="Cal" type="number" className="h-8 text-xs rounded-lg" value={meal.calories} onChange={(e) => updateMeal(mealIdx, "calories", e.target.value)} />
                    </div>
                    <div className="w-20">
                      <Label className="text-[10px] font-semibold text-stone-500 uppercase flex items-center gap-1 mb-1">Protein <span className="normal-case text-[9px] font-normal text-stone-400">opt</span></Label>
                      <Input placeholder="Protein" type="number" className="h-8 text-xs rounded-lg" value={meal.protein} onChange={(e) => updateMeal(mealIdx, "protein", e.target.value)} />
                    </div>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-rose-500 shrink-0" onClick={() => removeMeal(mealIdx)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                  {incomplete && <p className="text-[10px] text-amber-600">Select a meal type and add at least one item</p>}
                  <div className="space-y-1.5">
                    {meal.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-1.5">
                        <Input
                          placeholder={`Item ${itemIdx + 1}, e.g. 200g Grilled Chicken`}
                          className="h-7 text-xs rounded-lg"
                          value={item}
                          onChange={(e) => updateMealItem(mealIdx, itemIdx, e.target.value)}
                        />
                        {meal.items.length > 1 && (
                          <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-stone-300 hover:text-rose-500 shrink-0" onClick={() => removeMealItem(mealIdx, itemIdx)}>
                            <X size={10} />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px] text-stone-500" onClick={() => addMealItem(mealIdx)}>
                      <Plus className="mr-1 h-2.5 w-2.5" /> Add Item
                    </Button>
                  </div>
                </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
