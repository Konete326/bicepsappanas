import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validators, getErrClass } from "@/utils/validation";

export default function PlanForm({ plan, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    planName: plan?.planName || "",
    duration: plan?.duration || 1,
    price: plan?.price ?? "",
    description: plan?.description || ""
  });

  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const rules = {
      planName: validators.name,
      duration: validators.positiveNum,
      price: validators.nonNegNum,
    };
    if (rules[field]) setErrors((prev) => ({ ...prev, [field]: rules[field](value) }));
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (plan?._id) {
        return API.put(`/plans/${plan._id}`, payload);
      }
      return API.post("/plans", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
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
        <Input id="planName" placeholder="e.g. Gold Monthly" className={getErrClass(errors, "planName")} value={formData.planName} onChange={(e) => { setFormData({ ...formData, planName: e.target.value }); validate("planName", e.target.value); }} onBlur={(e) => validate("planName", e.target.value)} required />
        {errors.planName && <p className="text-[11px] text-red-500 mt-1">{errors.planName}</p>}
      </div>
      <div>
        <Label htmlFor="duration">Duration (Months)</Label>
        <Input id="duration" type="number" min={1} placeholder="e.g. 12" className={getErrClass(errors, "duration")} value={formData.duration} onChange={(e) => { setFormData({ ...formData, duration: parseInt(e.target.value) || 1 }); validate("duration", e.target.value); }} onBlur={(e) => validate("duration", e.target.value)} required />
        {errors.duration && <p className="text-[11px] text-red-500 mt-1">{errors.duration}</p>}
      </div>
      <div>
        <Label htmlFor="price">Price (PKR)</Label>
        <Input id="price" type="number" min={0} placeholder="Enter price" className={getErrClass(errors, "price")} value={formData.price} onChange={(e) => { setFormData({ ...formData, price: e.target.value === "" ? "" : parseInt(e.target.value) }); validate("price", e.target.value); }} onBlur={(e) => validate("price", formData.price)} required />
        {errors.price && <p className="text-[11px] text-red-500 mt-1">{errors.price}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Includes gym access and personal training"
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
        <Button type="submit" disabled={mutation.isPending || hasErrors}>
          {mutation.isPending ? "Saving..." : "Save Plan"}
        </Button>
      </div>
    </form>
  );
}
