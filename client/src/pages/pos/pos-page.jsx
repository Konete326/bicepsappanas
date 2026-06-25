import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Search, ShoppingCart, Package, Minus, Plus, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customerName, setCustomerName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", searchTerm],
    queryFn: async () => {
      const res = await API.get("/products", { params: { search: searchTerm, status: "Active" } });
      return res.data.data || [];
    },
  });

  const saleMutation = useMutation({
    mutationFn: (payload) => API.post("/sales", payload),
    onSuccess: () => {
      toast({ title: "Sale completed successfully" });
      setCart([]);
      setCustomerName("");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      navigate("/sales");
    },
    onError: (err) =>
      toast({
        title: err.response?.data?.message || "Sale failed",
        variant: "destructive",
      }),
  });

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          maxStock: product.stock,
          image: product.images?.[0] || product.image || null,
        },
      ];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(newQty, item.maxStock) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    saleMutation.mutate({
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.quantity * item.price,
      })),
      totalAmount: cartTotal,
      paymentMethod,
      customerName,
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-6 w-6 text-stone-700" />
        <h2 className="text-xl font-bold text-stone-900 font-outfit uppercase">Point of Sale</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-stone-500" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-1">
                {(products || []).length === 0 && (
                  <div className="col-span-full text-center text-stone-500 py-10">
                    No products found.
                  </div>
                )}
                {(products || []).map((product) => {
                  const outOfStock = product.stock <= 0;
                  const lowStock = !outOfStock && product.stock <= product.lowStockThreshold;
                  const primaryImage = product.images?.[0] || product.image;
                  return (
                    <button
                      key={product._id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => addToCart(product)}
                      className={`flex flex-col items-start rounded-xl border overflow-hidden text-left transition-all ${
                        outOfStock
                          ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
                          : "border-stone-200 bg-white hover:border-stone-400 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      <div className="w-full h-28 bg-stone-100 flex items-center justify-center border-b border-stone-100">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-stone-300" />
                        )}
                      </div>
                      <div className="p-3 w-full flex flex-col gap-1.5">
                        <p className="text-xs font-semibold text-stone-800 line-clamp-2" title={product.name}>{product.name}</p>
                        <p className="text-sm font-bold text-stone-600">
                          PKR {Number(product.price).toLocaleString("en-PK")}
                        </p>
                        <div className="mt-1">
                          {outOfStock ? (
                            <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                          ) : lowStock ? (
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">
                              Low Stock ({product.stock})
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              Stock: {product.stock}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 flex flex-col max-h-[80vh]">
          <CardHeader className="pb-2 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold font-outfit uppercase flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Cart
              </CardTitle>
              <Badge variant="secondary">{cart.length} items</Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                <ShoppingCart className="h-10 w-10 mb-2" />
                <p className="text-sm">Cart is empty</p>
              </div>
            )}
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{item.name}</p>
                  <p className="text-xs text-stone-500">
                    PKR {Number(item.price).toLocaleString("en-PK")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    disabled={item.quantity >= item.maxStock}
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm font-bold text-stone-800 w-24 text-right">
                  PKR {Number(item.quantity * item.price).toLocaleString("en-PK")}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeFromCart(item.productId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>

          <div className="border-t border-stone-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-stone-900">Total</span>
              <span className="text-lg font-bold text-stone-900">
                PKR {Number(cartTotal).toLocaleString("en-PK")}
              </span>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0}
              onClick={() => setIsModalOpen(true)}
            >
              Checkout
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
            <DialogDescription>
              Review the sale details and confirm payment to complete the transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between bg-stone-50 p-3 rounded-lg border border-stone-100">
              <span className="text-sm font-semibold text-stone-600">Total Amount</span>
              <span className="text-xl font-bold text-stone-900">PKR {Number(cartTotal).toLocaleString("en-PK")}</span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Easy Paisa">Easy Paisa</SelectItem>
                  <SelectItem value="Jazz Cash">Jazz Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Customer Name <span className="text-stone-400 font-normal">(optional)</span></Label>
              <Input
                placeholder="Walk-in customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="rounded-lg" disabled={saleMutation.isPending} onClick={handleCompleteSale}>
              {saleMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
