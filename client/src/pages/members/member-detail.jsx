import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/format";
import API from "@/api/api";
import { Loader2, ArrowLeft, CreditCard, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentGrid from "./payment-grid";

export default function MemberDetail() {
  const { id } = useParams();

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const res = await API.get(`/members/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-stone-400" size={26} />
          <p className="text-[11px] text-stone-400 tracking-wide">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-stone-500 text-sm">Member not found.</p>
        <Link to="/members">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const initials = member.fullName
    ? member.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const isActive = member.status?.toLowerCase() === "active";

  return (
    <div className="flex flex-col bg-stone-50">

      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between gap-6 flex-shrink-0">

        <div className="flex items-center gap-3">
          <Link to="/members">
            <button className="w-8 h-8 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center transition-colors shadow-sm flex-shrink-0">
              <ArrowLeft size={14} className="text-stone-600" />
            </button>
          </Link>
          <div className="border-l border-stone-200 pl-3">
            <h1 className="text-sm font-bold text-stone-900 leading-tight">Member Profile</h1>
            <p className="text-[10px] text-stone-400 leading-tight">View and manage member information</p>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-1 justify-end">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 leading-tight">{member.fullName}</p>
              <p className="text-[10px] text-stone-400 leading-tight">s/o {member.fatherName}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-stone-200" />

          <div className="flex items-center gap-5">
            <div>
              <p className="text-[9px] font-medium text-stone-400 uppercase tracking-widest leading-tight">Roll No</p>
              <p className="text-xs font-bold text-stone-800 leading-tight">{member.rollNo || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium text-stone-400 uppercase tracking-widest leading-tight">Cell</p>
              <p className="text-xs font-bold text-stone-800 leading-tight">{member.cellNo || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium text-stone-400 uppercase tracking-widest leading-tight">CNIC</p>
              <p className="text-xs font-bold text-stone-800 leading-tight">{member.cnic || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium text-stone-400 uppercase tracking-widest leading-tight">Type</p>
              <p className="text-xs font-bold text-stone-800 leading-tight">{member.memberType || "Basic"}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium text-stone-400 uppercase tracking-widest leading-tight">Joined</p>
              <p className="text-xs font-bold text-stone-800 leading-tight">{formatDate(member.joiningDate)}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium text-stone-400 uppercase tracking-widest leading-tight">Renewal</p>
              <p className="text-xs font-bold text-stone-800 leading-tight">{formatDate(member.renewalDate)}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-stone-200" />

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border flex-shrink-0 ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />
            {member.status || "Unknown"}
          </span>



        </div>
      </div>

      <div className="pt-4 px-6 pb-4">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-900">12-Month Payment Grid</h2>
              <p className="text-[10px] text-stone-400 mt-0.5">Monthly fee tracker for {new Date().getFullYear()}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/payments/new?memberId=${member._id}`}>
                <button className="flex items-center justify-center gap-2 px-5 py-2 bg-stone-900 hover:bg-stone-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm min-w-[150px]">
                  <CreditCard size={13} />
                  Record Payment
                </button>
              </Link>
              <Link to={`/measurements/new?memberId=${member._id}`}>
                <button className="flex items-center justify-center gap-2 px-5 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition-colors shadow-sm min-w-[150px]">
                  <Ruler size={13} />
                  Add Measurements
                </button>
              </Link>
            </div>
          </div>
          <div className="p-4">
            <PaymentGrid memberId={member._id} />
          </div>
        </div>
      </div>

    </div>
  );
}
