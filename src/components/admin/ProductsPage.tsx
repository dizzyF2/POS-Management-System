import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit3, Trash2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

type Product = {
    id: number;
    name: string;
    price: number;
    barcode: string;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        barcode: "",
    });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const result = await invoke<Product[]>("get_products_cmd");
            if (result) setProducts(result);
        } catch (e) {
            console.error("fetch_products failed:", e);
        }
    };

    const addProduct = async () => {
        if (!newProduct.name.trim() || newProduct.price === "") return;

        const payload = {
            name: newProduct.name.trim(),
            price: parseFloat(newProduct.price),
            barcode: newProduct.barcode.trim() === "" ? null : newProduct.barcode.trim(),
        };

        try {
            await invoke("add_product_cmd", payload as any);
            setNewProduct({ name: "", price: "", barcode: "" });
            fetchProducts();
            toast.success("تمت إضافة المنتج بنجاح");
        } catch (e: any) {
            toast.error("فشل في إضافة المنتج");
        }
    };

    const startEdit = (product: Product) => setEditingProduct({ ...product });
    const cancelEdit = () => setEditingProduct(null);

    const saveEdit = async () => {
        if (!editingProduct) return;
        try {
            await invoke("update_product_cmd", {
                id: editingProduct.id,
                name: editingProduct.name,
                price: editingProduct.price,
                barcode: editingProduct.barcode,
            });
            setEditingProduct(null);
            fetchProducts();
            toast.success("تم تعديل المنتج");
        } catch {
            toast.error("فشل في تعديل المنتج");
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await invoke("delete_product_cmd", { id });
            await fetchProducts();
            toast.success("تم حذف المنتج");
        } catch {
            toast.error("فشل في حذف المنتج");
        }
    };

    return (
        <div className="p-4 md:p-6">
            <Card className="shadow-lg rounded-2xl border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        إدارة المنتجات
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* قسم إضافة منتج */}
                    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <Input
                                type="text"
                                placeholder="اسم المنتج"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="border-gray-300"
                            />
                            <Input
                                type="number"
                                placeholder="السعر"
                                value={newProduct.price}
                                min="0"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || parseFloat(value) >= 0) {
                                        setNewProduct({ ...newProduct, price: value });
                                    }
                                }}
                                className="border-gray-300"
                            />
                            <Input
                                type="text"
                                placeholder="الباركود (اختياري)"
                                value={newProduct.barcode}
                                onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                                className="border-gray-300"
                            />
                            <Button
                                onClick={addProduct}
                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" /> إضافة
                            </Button>
                        </div>
                    </div>

                    {/* جدول المنتجات */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-red-50 hover:bg-red-50">
                                    <TableHead className="text-gray-700">الاسم</TableHead>
                                    <TableHead className="text-gray-700">السعر</TableHead>
                                    <TableHead className="text-gray-700">الباركود</TableHead>
                                    <TableHead className="text-right text-gray-700 pr-8">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            {editingProduct?.id === p.id ? (
                                                <Input
                                                    value={editingProduct.name}
                                                    onChange={(e) =>
                                                        setEditingProduct({ ...editingProduct, name: e.target.value })
                                                    }
                                                />
                                            ) : (
                                                p.name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingProduct?.id === p.id ? (
                                                <Input
                                                    type="number"
                                                    value={editingProduct.price}
                                                    onChange={(e) =>
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            price: parseFloat(e.target.value),
                                                        })
                                                    }
                                                />
                                            ) : (
                                                `${p.price} ج.م`
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingProduct?.id === p.id ? (
                                                <Input
                                                    value={editingProduct.barcode ?? ""}
                                                    onChange={(e) =>
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            barcode: e.target.value,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                p.barcode || "-"
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {editingProduct?.id === p.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={saveEdit}
                                                        className="bg-green-600 hover:bg-green-500 text-white flex items-center gap-1"
                                                    >
                                                        <Check size={16} /> حفظ
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={cancelEdit}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <X size={16} /> إلغاء
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={() => startEdit(p)}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => deleteProduct(p.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {products.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-gray-500 p-4">
                                            لا توجد منتجات بعد.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
