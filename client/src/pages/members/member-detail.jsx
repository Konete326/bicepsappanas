import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CreditCard, Ruler, Activity } from "lucide-react";
import PaymentGrid from "./payment-grid";

export default function MemberDetail() {
  const { id } = useParams();

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const res = await API.get(`/members/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-500" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-stone-500">Member not found.</p>
        <Link to="/members">
          <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/members">
          <Button size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Member Profile</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-stone-200 shadow-sm md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-stone-900">Personal Info</CardTitle>
              <Badge>{member.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-stone-500">Roll Number</p>
              <p className="font-semibold text-stone-900">{member.rollNo}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Full Name / Father's Name</p>
              <p className="font-semibold text-stone-900">{member.fullName} / {member.fatherName}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Cell Number</p>
              <p className="font-semibold text-stone-900">{member.cellNo}</p>
            </div>
            {member.email && (
              <div>
                <p className="text-xs text-stone-500">Email Address</p>
                <p className="font-semibold text-stone-900">{member.email}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-stone-500">Address</p>
              <p className="font-semibold text-stone-900">{member.address}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Joining Date / Renewal Date</p>
              <p className="font-semibold text-stone-900">
                {new Date(member.joiningDate).toLocaleDateString()} / {new Date(member.renewalDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="border border-stone-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-stone-100">
              <CardTitle className="text-lg font-semibold text-stone-900">12-Month Payment Grid</CardTitle>
              <div className="flex gap-2">
                <Link to="/payments/new">
                  <Button size="sm"><CreditCard className="mr-2 h-4 w-4" /> Pay Fees</Button>
                </Link>
                <Link to={`/measurements/new?memberId=${member._id}`}>
                  <Button size="sm"><Ruler className="mr-2 h-4 w-4" /> Log Stats</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <PaymentGrid memberId={member._id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
