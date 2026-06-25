import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { validators, getErrClass } from "@/utils/validation";
import { Loader2, CreditCard, Banknote, FileText, Calendar, Wallet } from "lucide-react";

/* ── tiny helper ── */
function FieldIcon({ icon: Icon }) {
  return (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
      <Icon size={15} />
    </span>
  );
}

function Field({ label, error, icon, children }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
        {label}
      </Label>
      <div className="relative">
        {icon && <FieldIcon icon={icon} />}
        {children}
      </div>
      {error && <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">⚠ {error}</p>}
    </div>
  );
}

const inputClass = (icon) =>
  `h-9 text-sm border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-300 rounded-lg transition-all ${icon ? "pl-8" : ""}`;

export default function LedgerEntryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    transactionType: "advance",
    amount: "",
    referenceNote: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    salaryMonth: ""
  });

  const { data: ledgerData } = useQuery({
    queryKey: ["ledger", id],
    queryFn: async () => {
      const res = await API.get(`/trainers/ledger/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  const dataEntries = Array.isArray(ledgerData?.entries) ? ledgerData.entries : (Array.isArray(ledgerData) ? ledgerData : []);
  const paidMonths = dataEntries
        .filter(e => e.transactionType === "salary" && e.salaryMonth)
        .map(e => e.salaryMonth);

  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const rules = {
      amount: validators.positiveNum,
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
      queryClient.invalidateQueries({ queryKey: ["ledger", id] });
      queryClient.invalidateQueries({ queryKey: ["trainer-salary-status"] });
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      toast({ title: "Payment recorded successfully" });
      navigate(`/trainers/${id}/ledger`);
    },
    onError: (err) => {
      toast({
        title: "Failed to save payment",
        description: err.response?.data?.message || "Please check your inputs.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-outfit uppercase">Add Payment</h2>
        {ledgerData?.trainer?.fullName && (
          <div className="text-sm font-semibold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full flex items-center gap-2">
            Paying: <span className="text-stone-900">{ledgerData.trainer.fullName}</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          
          {/* Left Column: Payment Info */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
              <CreditCard size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Payment Details</span>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">
              <Field label="Payment Purpose" icon={CreditCard}>
                <Select value={formData.transactionType} onValueChange={(val) => {
                  let updatedAmount = formData.amount;
                  if (val === "salary" && ledgerData?.trainer?.baseSalary) {
                    updatedAmount = ledgerData.trainer.baseSalary;
                  }
                  setFormData({ ...formData, transactionType: val, amount: updatedAmount });
                  validate("amount", updatedAmount);
                }}>
                  <SelectTrigger id="type" className={`h-9 text-sm pl-8 border-stone-200 rounded-lg`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advance">Advance</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="deduction">Deduction / Fine</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {formData.transactionType === "salary" && (
                <Field label="Salary Month" icon={Calendar}>
                  <Select value={formData.salaryMonth} onValueChange={(val) => setFormData({ ...formData, salaryMonth: val })}>
                    <SelectTrigger className={`h-9 text-sm pl-8 border-stone-200 rounded-lg`}>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026"].map(m => {
                        const isPaid = paidMonths.includes(m);
                        return (
                          <SelectItem key={m} value={m} disabled={isPaid}>
                            <span className={isPaid ? "text-rose-500 font-semibold" : ""}>{m} {isPaid && "(Paid)"}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              <Field label="Amount (PKR)" error={errors.amount} icon={Banknote}>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  placeholder="e.g. 5000"
                  className={inputClass(true) + " " + getErrClass(errors, "amount")}
                  value={formData.amount}
                  onChange={(e) => { setFormData({ ...formData, amount: e.target.value === "" ? "" : parseInt(e.target.value) }); validate("amount", e.target.value); }}
                  onBlur={(e) => validate("amount", formData.amount)}
                  required
                />
              </Field>
            </div>
          </div>

          {/* Right Column: Transaction Info */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
              <FileText size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Transaction Info</span>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1">
              
              <Field label="Payment Date" icon={Calendar}>
                <Input
                  type="date"
                  className={`${inputClass(true)} bg-stone-50 text-stone-500 cursor-not-allowed select-none focus:ring-0`}
                  value={formData.paymentDate}
                  readOnly
                  tabIndex={-1}
                />
              </Field>

              <Field label="Payment Method" icon={Wallet}>
                <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}>
                  <SelectTrigger className={`h-9 text-sm pl-8 border-stone-200 rounded-lg`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Notes / Reason (Optional)" error={errors.referenceNote} icon={FileText}>
                <Input
                  id="reference"
                  className={inputClass(true)}
                  value={formData.referenceNote}
                  onChange={(e) => { setFormData({ ...formData, referenceNote: e.target.value }); }}
                  placeholder="e.g. June Advance, Salary payment..."
                />
              </Field>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/trainers/${id}/ledger`)}
            className="text-sm rounded-lg border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white transition-all"
          >
            ← Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || hasErrors}
            className="text-sm rounded-lg bg-stone-800 hover:bg-stone-700 text-white px-6 gap-2"
          >
            {mutation.isPending && <Loader2 className="animate-spin h-4 w-4" />}
            Save Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
