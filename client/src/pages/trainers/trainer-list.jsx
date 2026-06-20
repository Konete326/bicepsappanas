import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, BookOpen } from "lucide-react";

export default function TrainerList() {
  const { data: trainers, isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await API.get("/trainers");
      return res.data.data || [];
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Trainers Directory</h2>
        <Link to="/trainers/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Register Trainer</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const list = trainers || [];
                if (list.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-stone-500 py-6">
                        No trainers registered yet.
                      </TableCell>
                    </TableRow>
                  );
                }
                return list.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-semibold text-stone-900">{t.fullName}</TableCell>
                    <TableCell>{t.phone}</TableCell>
                    <TableCell>{t.email || "N/A"}</TableCell>
                    <TableCell>PKR {t.baseSalary}</TableCell>
                    <TableCell>PKR {t.commissionRate} / Session</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/trainers/${t._id}/ledger`}>
                        <Button size="sm" className="h-8">
                          <BookOpen className="mr-2 h-4 w-4" /> Ledger
                        </Button>
                      </Link>
                      <Link to={`/trainers/edit/${t._id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
