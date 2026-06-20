import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit, Dumbbell, Clipboard } from "lucide-react";

export default function RoutineView() {
  const [memberId, setMemberId] = useState("");

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["members-lookup-routines"],
    queryFn: async () => {
      const res = await API.get("/members");
      return res.data.data || [];
    }
  });

  const { data: routine, isLoading: loadingRoutine } = useQuery({
    queryKey: ["routine", memberId],
    queryFn: async () => {
      const res = await API.get(`/routines/${memberId}`);
      return res.data.data;
    },
    enabled: !!memberId
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Gym Workout & Nutrition Guidelines</h2>
        {memberId && (
          <Link to={`/routines/edit/${memberId}`}>
            <Button size="sm"><Edit className="mr-2 h-4 w-4" /> Edit Guidelines</Button>
          </Link>
        )}
      </div>

      <div className="max-w-xs">
        <Select value={memberId} onValueChange={setMemberId}>
          <SelectTrigger><SelectValue placeholder="Choose member" /></SelectTrigger>
          <SelectContent>
            {members?.length > 0 ? (
              members.map((m) => <SelectItem key={m._id} value={m._id}>{m.fullName} ({m.rollNo})</SelectItem>)
            ) : (
              <SelectItem value="__none__" disabled>No members found</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {memberId && (
        <>
          {loadingRoutine ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-stone-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-stone-200 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 border-b border-stone-100">
                  <Dumbbell className="h-5 w-5 text-stone-700" />
                  <CardTitle className="text-sm font-semibold">Active Workout Splits</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 min-h-48 whitespace-pre-line text-sm text-stone-700">
                  {routine?.exerciseSchedule || "No workout routines logged yet for this member."}
                </CardContent>
              </Card>

              <Card className="border border-stone-200 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 border-b border-stone-100">
                  <Clipboard className="h-5 w-5 text-stone-700" />
                  <CardTitle className="text-sm font-semibold">Daily Meal & Diet Rules</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 min-h-48 whitespace-pre-line text-sm text-stone-700">
                  {routine?.mealPlan || "No nutritional targets logged yet for this member."}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
