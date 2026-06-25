import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Package, Barcode, Tag, DollarSign, Boxes,
  AlertTriangle, Image as ImageIcon, Save, X,
} from "lucide-react";
import { validators, getErrClass } from "@/utils/validation";

function FieldIcon({ icon: Icon }) {
  return (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
      <Icon size={15} />
    </span>
  );
}

function Field({ label, optional, error, icon, children }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
        {label}
        {optional && (
          <span className="normal-case text-[10px] font-normal text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">
            optional
          </span>
        )}
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
  `h-9 text-sm border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-300 rounded-lg transition-all ${icon ? "pl-9" : ""}`;

function PKRIcon() {
  return <span className="text-[10px] font-bold tracking-wider">PKR</span>;
}

const preventNegativeInput = (e) => {
  if (['-', 'e', 'E', '+'].includes(e.key)) {
    e.preventDefault();
  }
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    costPrice: "",
    stock: "",
    lowStockThreshold: "5",
    description: "",
    status: "Active",
    images: [],
  });

  const [errors, setErrors] = useState({});

  const validate = (field, value, currentFormData = formData) => {
    const rules = {
      name: validators.name,
      price: (v) => {
        const err = validators.positiveNum(v);
        if (!err && currentFormData.costPrice !== "" && Number(currentFormData.costPrice) > Number(v)) {
          return "Cannot be less than cost price";
        }
        return err;
      },
      costPrice: (v) => {
        const err = (v === "" || v === undefined ? "" : validators.nonNegNum(v));
        if (!err && v !== "" && currentFormData.price !== "" && Number(v) > Number(currentFormData.price)) {
          return "Cannot exceed selling price";
        }
        return err;
      },
      stock: validators.nonNegNum,
    };
    if (rules[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev, [field]: rules[field](value) };
        if (field === "price" && !newErrors.price && currentFormData.costPrice !== "") {
          newErrors.costPrice = rules.costPrice(currentFormData.costPrice);
        } else if (field === "costPrice" && !newErrors.costPrice && currentFormData.price !== "") {
          newErrors.price = rules.price(currentFormData.price);
        }
        return newErrors;
      });
    }
  };

  const hasErrors = Object.values(errors).some((e) => e !== "") || !formData.category;

  const { data: productData, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await API.get(`/products/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (productData) {
      let imgs = [];
      if (productData.images && productData.images.length > 0) imgs = productData.images;
      else if (productData.image) imgs = [productData.image];

      setFormData({
        name: productData.name || "",
        category: productData.category || "",
        price: productData.price ?? "",
        costPrice: productData.costPrice ?? "",
        stock: productData.stock ?? "",
        lowStockThreshold: productData.lowStockThreshold ?? "5",
        description: productData.description || "",
        status: productData.status || "Active",
        images: imgs,
      });
    }
  }, [productData]);

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("category", formData.category);
      fd.append("price", String(formData.price));
      fd.append("costPrice", String(formData.costPrice || 0));
      fd.append("stock", String(formData.stock));
      fd.append("lowStockThreshold", String(formData.lowStockThreshold || 5));
      fd.append("description", formData.description || "");
      fd.append("status", formData.status);
      
      formData.images.forEach(img => {
        if (img instanceof File) {
          fd.append("images", img);
        } else {
          fd.append("existingImages", img);
        }
      });

      if (id) return API.put(`/products/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      return API.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: `Product successfully ${id ? "updated" : "added"}` });
      navigate("/inventory");
    },
    onError: (err) => {
      toast({
        title: "Error saving product",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  const set = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      validate(field, value, next);
      return next;
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => {
        const newImages = [...prev.images, ...files].slice(0, 3);
        return { ...prev, images: newImages };
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center p-16">
        <Loader2 className="animate-spin text-stone-400 w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
              <Package size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Product Details</span>
              {id && (
                <div className="ml-auto flex items-center gap-1.5 bg-white border border-stone-200 rounded-md px-2.5 py-1">
                  <span className="text-[10px] font-bold text-stone-600 uppercase">Edit Mode</span>
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1">
              <Field label="Product Images" optional>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {formData.images.map((img, index) => {
                      const previewUrl = img instanceof File ? URL.createObjectURL(img) : img;
                      return (
                        <div key={index} className="relative h-24 w-24 shrink-0 rounded-lg border border-stone-200 overflow-hidden group">
                          <img src={previewUrl} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-stone-500 hover:text-red-500 hover:bg-red-50"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                    
                    {formData.images.length < 3 && (
                      <div
                        className={`h-24 shrink-0 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center bg-stone-50 cursor-pointer hover:border-stone-400 transition-colors text-stone-400 hover:text-stone-600 ${formData.images.length === 0 ? "w-full" : "flex-1 min-w-[96px]"}`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon size={20} className="mb-1" />
                        <span className="text-[10px] text-center px-2">Add Image<br/>({3 - formData.images.length} left)</span>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </Field>

              <Field label="Product Name" error={errors.name} icon={Package}>
                <Input
                  id="name"
                  placeholder="e.g. Whey Protein Isolate 5lb"
                  className={inputClass(true) + " " + getErrClass(errors, "name")}
                  value={formData.name}
                  onChange={set("name")}
                  onBlur={(e) => validate("name", e.target.value)}
                  required
                />
              </Field>

              <div className="grid grid-cols-1 gap-3">
                <Field label="Category" error={!formData.category ? "Required" : ""} icon={Tag}>
                  <Select
                    value={formData.category || undefined}
                    onValueChange={(val) => {
                      setFormData((prev) => ({ ...prev, category: val }));
                      setErrors((prev) => ({ ...prev, category: "" }));
                    }}
                  >
                    <SelectTrigger className={`h-9 text-sm pl-8 border-stone-200 rounded-lg ${!formData.category ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
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
                </Field>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
              <DollarSign size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Pricing & Inventory</span>
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1">
              
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (PKR)" error={errors.price} icon={PKRIcon}>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    placeholder="e.g. 8500"
                    className={inputClass(true) + " pl-10 " + getErrClass(errors, "price")}
                    value={formData.price}
                    onChange={set("price")}
                    onBlur={(e) => validate("price", e.target.value)}
                    onKeyDown={preventNegativeInput}
                    required
                  />
                </Field>

                <Field label="Cost Price" optional error={errors.costPrice} icon={PKRIcon}>
                  <Input
                    id="costPrice"
                    type="number"
                    min={0}
                    placeholder="e.g. 6000"
                    className={inputClass(true) + " pl-10 " + getErrClass(errors, "costPrice")}
                    value={formData.costPrice}
                    onChange={set("costPrice")}
                    onBlur={(e) => validate("costPrice", e.target.value)}
                    onKeyDown={preventNegativeInput}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Stock" error={errors.stock} icon={Boxes}>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    placeholder="e.g. 50"
                    className={inputClass(true) + " " + getErrClass(errors, "stock")}
                    value={formData.stock}
                    onChange={set("stock")}
                    onBlur={(e) => validate("stock", e.target.value)}
                    onKeyDown={preventNegativeInput}
                    required
                  />
                </Field>

                <Field label="Low Stock Alert" icon={AlertTriangle}>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    className={inputClass(true)}
                    value={formData.lowStockThreshold}
                    onChange={set("lowStockThreshold")}
                    onKeyDown={preventNegativeInput}
                  />
                </Field>
              </div>

              <Field label="Status">
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className={`h-9 text-sm border-stone-200 rounded-lg ${formData.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">🟢 Active</SelectItem>
                    <SelectItem value="Inactive">🔴 Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Description" optional>
                <Textarea
                  id="description"
                  placeholder="e.g. Premium whey protein isolate with 25g protein per serving..."
                  className="text-sm border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-300 rounded-lg resize-none"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </Field>
              
            </div>
          </div>

        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory")}
            className="text-sm rounded-lg border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white transition-all"
          >
            ← Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || hasErrors}
            className="text-sm rounded-lg bg-stone-800 hover:bg-stone-700 text-white px-6 gap-2"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {id ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
