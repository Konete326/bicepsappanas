import { useState, useEffect } from "react";
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

export default function PaymentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [memberId, setMemberId] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [trxNo, setTrxNo] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const preselected = searchParams.get("memberId");
    if (preselected) setMemberId(preselected);
  }, [searchParams]);

  const validate = (field, value) => {
    const rules = { amount: validators.positiveNum, trxNo: validators.text };
    if (rules[field]) setErrors((prev) => ({ ...prev, [field]: rules[field](value) }));
  };

  const hasErrors = Object.values(errors).some((e) => e !== "");

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["members-lookup"],
    queryFn: async () => {
      const res = await API.get("/members");
      return res.data.data || [];
    }
  });

  const selectedMember = members?.find((m) => m._id === memberId);
  const planPrice = selectedMember?.monthlyFee || 0;
  const outstandingDues = Math.max(0, planPrice - (parseInt(amountReceived) || 0));

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/payments", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast({ title: "Payment recorded successfully" });
      queryClient.invalidateQueries({ queryKey: ["payment-grid", memberId] });
      navigate(`/payments/receipt/${data.data?._id || ""}`);
    },
    onError: (err) => {
      toast({
        title: "Failed to record payment",
        description: err.response?.data?.message || "Verify your inputs and try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memberId) {
      toast({ title: "Please select a member", variant: "destructive" });
      return;
    }
    mutation.mutate({
      memberId,
      amountReceived: parseInt(amountReceived) || 0,
      paymentMethod,
      chequeOrTransactionNo: paymentMethod !== "Cash" ? trxNo : null
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 font-outfit uppercase">Record Fees Payment</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="sm:col-span-2">
          <Label htmlFor="memberSelect">Select Member</Label>
          {loadingMembers ? (
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <Loader2 className="animate-spin h-4 w-4" /> Loading members...
            </div>
          ) : (
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger id="memberSelect"><SelectValue placeholder="Choose member" /></SelectTrigger>
              <SelectContent>
                {members?.length > 0 ? (
                  members.map((m) => (
                    <SelectItem key={m._id} value={m._id}>
                      {m.fullName} ({m.rollNo})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none__" disabled>No members found</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="amount">Amount Received (PKR)</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            placeholder="Enter amount"
            className={getErrClass(errors, "amount")}
            value={amountReceived}
            onChange={(e) => { setAmountReceived(e.target.value); validate("amount", e.target.value); }}
            onBlur={(e) => validate("amount", e.target.value)}
            required
          />
          {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
        </div>

        {selectedMember && (
          <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1 text-stone-600 border border-stone-100">
            <p><strong>Monthly Fee:</strong> PKR {planPrice}</p>
            <p><strong>Renewal:</strong> {new Date(selectedMember.renewalDate).toLocaleDateString()}</p>
          </div>
        )}

        <div className="sm:col-span-2">
          <Label htmlFor="method">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger id="method"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Easy Paisa">Easy Paisa</SelectItem>
              <SelectItem value="Jazz Cash">Jazz Cash</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
              <SelectItem value="UPI/Online">UPI / Online Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod !== "Cash" && (
          <div>
            <Label htmlFor="trxNo">Cheque or Transaction Reference No</Label>
            <Input
              id="trxNo"
              className={getErrClass(errors, "trxNo")}
              value={trxNo}
              onChange={(e) => { setTrxNo(e.target.value); validate("trxNo", e.target.value); }}
              onBlur={(e) => validate("trxNo", e.target.value)}
              required
            />
            {errors.trxNo && <p className="text-[11px] text-red-500 mt-1">{errors.trxNo}</p>}
          </div>
        )}

        {selectedMember && (
          <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-stone-100">
            <span className="text-stone-700">Calculated Outstanding Dues:</span>
            <span className={outstandingDues > 0 ? "text-red-600" : "text-green-600"}>
              PKR {outstandingDues}
            </span>
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2 pt-4">
          <Button type="button" onClick={() => navigate("/payments")}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending || hasErrors}>
            {mutation.isPending ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
