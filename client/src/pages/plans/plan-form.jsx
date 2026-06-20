import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function PlanForm({ plan, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    planName: plan?.planName || "",
    duration: plan?.duration || 1,
    price: plan?.price || 0,
    description: plan?.description || ""
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (plan?._id) {
        return API.put(`/plans/${plan._id}`, payload);
      }
      return API.post("/plans", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["plans"]);
      toast({ title: `Plan ${plan?._id ? "updated" : "created"} successfully` });
      onSuccess();
    },
    onError: (err) => {
      toast({
        title: "Operation failed",
        description: err.response?.data?.message || "Invalid values provided",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto p-4 border border-stone-200 rounded-xl bg-white shadow-sm">
      <div>
        <Label htmlFor="planName">Plan Name</Label>
        <Input
          id="planName"
          value={formData.planName}
          onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="duration">Duration (Months)</Label>
        <Input
          id="duration"
          type="number"
          min={1}
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price (PKR)</Label>
        <Input
          id="price"
          type="number"
          min={0}
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Plan"}
        </Button>
      </div>
    </form>
  );
}
