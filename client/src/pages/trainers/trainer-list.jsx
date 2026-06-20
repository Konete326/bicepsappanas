import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit, BookOpen, Search } from "lucide-react";

export default function TrainerList() {
  const [search, setSearch] = useState("");

  const { data: trainers, isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await API.get("/trainers");
      return res.data.data || [];
    }
  });

  const filtered = trainers?.filter((t) => {
    const q = search.toLowerCase();
    return t.fullName?.toLowerCase().includes(q) || t.phone?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q);
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Trainers Directory</h2>
        <Link to="/trainers/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Register Trainer</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="relative sm:col-span-9">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <Input placeholder="Search by name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="sm:col-span-3 flex items-center px-3 text-sm text-stone-500 border border-stone-200 rounded-md bg-stone-50">
          {filtered.length} trainer(s)
        </div>
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
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (isLoading) return null;
                if (filtered.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-stone-500 py-6">
                        {search ? "No trainers match your search." : "No trainers registered yet."}
                      </TableCell>
                    </TableRow>
                  );
                }
                return filtered.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-semibold text-stone-900">{t.fullName}</TableCell>
                    <TableCell>{t.gender || "N/A"}</TableCell>
                    <TableCell>{t.phone}</TableCell>
                    <TableCell>{t.email || "N/A"}</TableCell>
                    <TableCell>PKR {t.baseSalary}</TableCell>
                    <TableCell>PKR {t.commissionRate} / Session</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/trainers/${t._id}/ledger`}>
                        <Button size="sm" className="h-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg">
                          <BookOpen className="mr-2 h-4 w-4" /> Ledger
                        </Button>
                      </Link>
                      <Link to={`/trainers/edit/${t._id}`}>
                        <Button size="icon" className="h-8 w-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg">
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
