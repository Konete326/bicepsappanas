import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { validators, getErrClass } from "@/utils/validation";

export default function LedgerEntryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    transactionType: "Debit",
    amount: 0,
    referenceNote: ""
  });

  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const rules = {
      amount: validators.positiveNum,
      referenceNote: validators.text,
    };
    if (rules[field]) setErrors((prev) => ({ ...prev, [field]: rules[field](value) }));
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/trainers/ledger", {
        trainerId: id,
        ...payload
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ledger", id]);
      toast({ title: "Ledger transaction recorded successfully" });
      navigate(`/trainers/${id}/ledger`);
    },
    onError: (err) => {
      toast({
        title: "Failed to record transaction",
        description: err.response?.data?.message || "Invalid values provided.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 font-outfit uppercase">Log Ledger Entry</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 rounded-xl p-6 bg-white shadow-sm">
        <div>
          <Label htmlFor="type">Transaction Type</Label>
          <Select value={formData.transactionType} onValueChange={(val) => setFormData({ ...formData, transactionType: val })}>
            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Debit">Debit (Advance Outflow)</SelectItem>
              <SelectItem value="Credit">Credit (Adjustment / Payback)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Amount (PKR)</Label>
          <Input
            id="amount"
            type="number"
            min={1}
            className={getErrClass(errors, "amount")}
            value={formData.amount}
            onChange={(e) => { setFormData({ ...formData, amount: parseInt(e.target.value) || 0 }); validate("amount", e.target.value); }}
            onBlur={(e) => validate("amount", e.target.value)}
            required
          />
          {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
        </div>

        <div>
          <Label htmlFor="reference">Reference Note</Label>
          <Input
            id="reference"
            className={getErrClass(errors, "referenceNote")}
            value={formData.referenceNote}
            onChange={(e) => { setFormData({ ...formData, referenceNote: e.target.value }); validate("referenceNote", e.target.value); }}
            onBlur={(e) => validate("referenceNote", e.target.value)}
            placeholder="e.g., Cash Advance payment, May Adjustment"
            required
          />
          {errors.referenceNote && <p className="text-[11px] text-red-500 mt-1">{errors.referenceNote}</p>}
        </div>

        <div className="sm:col-span-2 flex justify-end gap-2 pt-4 border-t border-stone-100">
          <Button type="button" onClick={() => navigate(`/trainers/${id}/ledger`)}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending || hasErrors}>
            {mutation.isPending ? "Logging..." : "Confirm Entry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
