import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { validators, getErrClass } from "@/utils/validation";

const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PaymentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [memberId, setMemberId] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [trxNo, setTrxNo] = useState("");
  const [monthIndex, setMonthIndex] = useState(String(new Date().getMonth()));
  const [errors, setErrors] = useState({});
  const [openMemberPopover, setOpenMemberPopover] = useState(false);

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

  const { data: gridData, isLoading: loadingGrid } = useQuery({
    queryKey: ["payment-grid", memberId],
    queryFn: async () => {
      if (!memberId) return {};
      const res = await API.get(`/members/payment-grid/${memberId}`);
      return res.data.data.paymentGrid || {};
    },
    enabled: !!memberId,
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

  const isMonthPaid = gridData && gridData[monthIndex] === true;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memberId) {
      toast({ title: "Please select a member", variant: "destructive" });
      return;
    }
    if (isMonthPaid) {
      toast({ title: "Month already paid", variant: "destructive" });
      return;
    }
    mutation.mutate({
      memberId,
      amountReceived: parseInt(amountReceived) || 0,
      paymentMethod,
      chequeOrTransactionNo: paymentMethod !== "Cash" ? trxNo : null,
      monthIndex
    });
  };

  return (
    <div className="px-6 pb-6 pt-2 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center transition-colors shadow-sm"
          >
            <ArrowLeft size={14} className="text-stone-600" />
          </button>
          <h2 className="text-xl font-bold font-outfit uppercase">Record Fees Payment</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 rounded-xl p-5 bg-white shadow-sm">
            <div className="sm:col-span-2">
              <Label htmlFor="memberSelect">Select Member</Label>
              {loadingMembers ? (
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <Loader2 className="animate-spin h-4 w-4" /> Loading members...
                </div>
              ) : (
                <Popover open={openMemberPopover} onOpenChange={setOpenMemberPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMemberPopover}
                      className={`w-full justify-between font-normal ${!memberId && "text-muted-foreground"}`}
                    >
                      {memberId
                        ? (() => {
                            const m = members?.find((m) => m._id === memberId);
                            return m ? `${m.fullName} (${m.rollNo})` : "Select member...";
                          })()
                        : "Search member by name, roll no, or phone..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 sm:w-[500px]" align="start">
                    <Command filter={(value, search) => {
                       if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                       return 0;
                    }}>
                      <CommandInput placeholder="Type to search members..." />
                      <CommandList>
                        <CommandEmpty>No member found.</CommandEmpty>
                        <CommandGroup>
                          {members?.map((m) => {
                            const searchStr = `${m.fullName} ${m.rollNo} ${m.cellNo} ${m._id}`.toLowerCase();
                            return (
                              <CommandItem
                                key={m._id}
                                value={searchStr}
                                onSelect={() => {
                                  setMemberId(m._id);
                                  setOpenMemberPopover(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${memberId === m._id ? "opacity-100" : "opacity-0"}`}
                                />
                                <div className="flex flex-col">
                                  <span>{m.fullName} <span className="text-stone-500 ml-1">({m.rollNo || "No Roll No"})</span></span>
                                  <span className="text-xs text-stone-400">{m.cellNo}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div>
              <Label htmlFor="monthSelect">Select Month</Label>
              <Select value={monthIndex} onValueChange={setMonthIndex} disabled={!memberId || loadingGrid}>
                <SelectTrigger id="monthSelect" className={isMonthPaid ? "border-red-500 ring-1 ring-red-500 bg-red-50 text-red-700" : ""}>
                  <SelectValue placeholder="Choose month" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {MONTH_FULL.map((month, idx) => {
                    const isPaid = gridData && gridData[idx] === true;
                    return (
                      <SelectItem key={idx} value={String(idx)}>
                        {month} {isPaid ? "(Paid)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {isMonthPaid && <p className="text-[11px] font-bold text-red-500 mt-1">This month is already paid</p>}
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

            <div className="sm:col-span-2 mt-2 border-t border-stone-100 pt-4">
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
              <div className="sm:col-span-2">
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

            <div className="sm:col-span-2 flex justify-end gap-2 pt-6">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="rounded-full">Cancel</Button>
              <Button type="submit" disabled={mutation.isPending || hasErrors || isMonthPaid} className="rounded-full">
                {mutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          {selectedMember ? (
            <div className="border border-stone-200 rounded-xl p-6 bg-white shadow-sm sticky top-6">
              <h3 className="font-bold text-stone-800 mb-6 uppercase text-sm tracking-wider border-b border-stone-100 pb-3">Member Details</h3>
              <div className="space-y-5 text-sm">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Full Name</p>
                  <p className="font-semibold text-stone-800">{selectedMember.fullName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Roll No</p>
                    <p className="font-semibold text-stone-800">{selectedMember.rollNo || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Cell No</p>
                    <p className="font-semibold text-stone-800">{selectedMember.cellNo || "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Monthly Fee</p>
                    <p className="font-semibold text-stone-800">PKR {planPrice}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Renewal Date</p>
                    <p className="font-semibold text-stone-800">{new Date(selectedMember.renewalDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-5 border-t border-stone-100 mt-2">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">Current Transaction Dues</p>
                  {isMonthPaid ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-sm font-bold">
                        <Check size={13} strokeWidth={3} /> PAID
                      </span>
                      <p className="text-[10px] text-emerald-600 font-medium">This month has already been paid.</p>
                    </div>
                  ) : (
                    <>
                      <p className={`text-xl font-bold ${outstandingDues > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        PKR {outstandingDues}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1 leading-tight">
                        Calculated based on {amountReceived || 0} received vs {planPrice} fee.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-stone-200 rounded-xl p-6 bg-stone-50 shadow-sm flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-12 h-12 bg-stone-200 rounded-full mb-3 flex items-center justify-center text-stone-400 font-bold font-outfit text-xl">?</div>
              <p className="text-sm font-semibold text-stone-600">No Member Selected</p>
              <p className="text-xs text-stone-400 mt-1 max-w-[200px]">Select a member from the left to view their details and outstanding dues.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
