import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, Eye, Edit } from "lucide-react";

export default function MemberList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", search, status],
    queryFn: async () => {
      const res = await API.get("/members", { params: { search, status } });
      return res.data.data || [];
    }
  });

  const getStatusBadge = (s) => {
    switch (s) {
      case "Active": return <Badge variant="default">Active</Badge>;
      case "Expired": return <Badge variant="destructive">Expired</Badge>;
      default: return <Badge variant="secondary">{s}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Members Directory</h2>
        <Link to="/members/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Register Member</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="relative sm:col-span-9">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search Roll No or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="sm:col-span-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Frozen">Frozen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Cell Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const list = members || [];
                if (list.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-stone-500 py-6">
                        No members found.
                      </TableCell>
                    </TableRow>
                  );
                }
                return list.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="font-semibold">{member.rollNo}</TableCell>
                    <TableCell>{member.fullName}</TableCell>
                    <TableCell>{member.cellNo}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>{new Date(member.renewalDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/members/${member._id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      <Link to={`/members/edit/${member._id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
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
