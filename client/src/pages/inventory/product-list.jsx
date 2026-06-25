import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatPKR } from "@/utils/format";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Search, Edit, Trash2, AlertTriangle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const categoryColors = {
  Protein: "bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-50/80",
  Creatine: "bg-purple-50 text-purple-700 border-purple-200/50 hover:bg-purple-50/80",
  "Pre-Workout": "bg-orange-50 text-orange-700 border-orange-200/50 hover:bg-orange-50/80",
  BCAA: "bg-cyan-50 text-cyan-700 border-cyan-200/50 hover:bg-cyan-50/80",
  Vitamins: "bg-green-50 text-green-700 border-green-200/50 hover:bg-green-50/80",
  Accessories: "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-50/80",
  Clothing: "bg-pink-50 text-pink-700 border-pink-200/50 hover:bg-pink-50/80",
  Other: "bg-stone-50 text-stone-700 border-stone-200/50 hover:bg-stone-50/80",
};

const statusColors = {
  Active: "bg-green-50 text-green-700 border-green-200/50 hover:bg-green-50/80",
  Inactive: "bg-stone-50 text-stone-500 border-stone-200/50 hover:bg-stone-50/80",
};

export default function ProductList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [confirmState, setConfirmState] = useState({ open: false, id: null, name: "" });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search, category, status],
    queryFn: async () => {
      const res = await API.get("/products", {
        params: {
          search,
          category: category === "all" ? undefined : category,
          status: status === "all" ? undefined : status,
        },
      });
      return res.data.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => API.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product successfully deleted" });
    },
    onError: (err) => {
      toast({
        title: "Error deleting product",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (product) => {
    setConfirmState({ open: true, id: product._id, name: product.name });
  };

  const confirmDelete = () => {
    deleteMutation.mutate(confirmState.id);
    setConfirmState({ open: false, id: null, name: "" });
  };

  const cancelDelete = () => {
    setConfirmState({ open: false, id: null, name: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Inventory</h2>
        <Link to="/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="sm:col-span-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Protein">Protein</SelectItem>
              <SelectItem value="Creatine">Creatine</SelectItem>
              <SelectItem value="Pre-Workout">Pre-Workout</SelectItem>
              <SelectItem value="BCAA">BCAA</SelectItem>
              <SelectItem value="Vitamins">Vitamins</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-stone-500" />
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const list = products || [];
                if (list.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-stone-500 py-6">
                        No products found.
                      </TableCell>
                    </TableRow>
                  );
                }
                return list.map((product) => {
                  const isLowStock = product.stock <= product.lowStockThreshold;
                  const primaryImage = product.images?.[0] || product.image;
                  return (
                    <TableRow key={product._id}>
                      <TableCell>
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-stone-100 flex items-center justify-center">
                            <span className="text-stone-400 text-xs">N/A</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">{product.name}</TableCell>
                      <TableCell className="font-mono text-xs text-stone-500">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={categoryColors[product.category] || categoryColors.Other}>
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatPKR(product.price)}</TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <span className="flex items-center gap-1 text-red-600 font-semibold text-sm">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {product.stock}
                          </span>
                        ) : (
                          <span className="text-sm">{product.stock}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[product.status] || statusColors.Inactive}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link to={`/inventory/edit/${product._id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 bg-white text-stone-900 hover:bg-stone-100 border border-stone-900 rounded-lg">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-lg"
                          onClick={() => handleDelete(product)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmState.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-outfit uppercase text-base">Product Details</DialogTitle>
            <DialogDescription>
              Viewing details for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 shrink-0">
                  {selectedProduct.images?.[0] || selectedProduct.image ? (
                    <img
                      src={selectedProduct.images?.[0] || selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">N/A</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-bold text-stone-900">{selectedProduct.name}</h3>
                    <p className="font-mono text-xs text-stone-500">{selectedProduct.sku}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={categoryColors[selectedProduct.category] || categoryColors.Other}>
                      {selectedProduct.category}
                    </Badge>
                    <Badge variant="outline" className={statusColors[selectedProduct.status] || statusColors.Inactive}>
                      {selectedProduct.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-t border-stone-100 pt-4">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Selling Price</p>
                  <p className="font-semibold text-stone-800">{formatPKR(selectedProduct.price)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Cost Price</p>
                  <p className="font-semibold text-stone-800">{selectedProduct.costPrice ? formatPKR(selectedProduct.costPrice) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Current Stock</p>
                  <p className={`font-semibold ${selectedProduct.stock <= selectedProduct.lowStockThreshold ? 'text-red-600' : 'text-stone-800'}`}>
                    {selectedProduct.stock} units
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Low Stock Alert</p>
                  <p className="font-semibold text-stone-800">{selectedProduct.lowStockThreshold} units</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="border-t border-stone-100 pt-4">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">Description</p>
                  <p className="text-sm text-stone-600">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
