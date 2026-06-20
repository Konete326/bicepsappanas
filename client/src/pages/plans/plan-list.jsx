import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Edit } from "lucide-react";
import PlanForm from "./plan-form";

export default function PlanList() {
  const [editingPlan, setEditingPlan] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: plans, isLoading, refetch } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await API.get("/plans");
      return res.data.data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Membership Plans</h2>
        <Button onClick={() => { setEditingPlan(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id} className="border border-stone-200 shadow-sm flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-900">{plan.planName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <p className="text-2xl font-bold text-stone-900">PKR {plan.price}</p>
              <p className="text-xs text-stone-500">Duration: {plan.duration} Month(s)</p>
              <p className="text-sm text-stone-600">{plan.description || "No description provided."}</p>
            </CardContent>
            <CardFooter className="flex justify-end pt-4 border-t border-stone-100">
              <Button size="sm" variant="outline" onClick={() => { setEditingPlan(plan); setIsFormOpen(true); }}>
                <Edit className="mr-2 h-4.5 w-4.5" /> Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Membership Plan" : "Add Membership Plan"}</DialogTitle>
          </DialogHeader>
          <PlanForm
            plan={editingPlan}
            onSuccess={() => { setIsFormOpen(false); refetch(); }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
