import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
}

interface CartItem {
    product: Product;
    quantity: number;
    extraAmount?: number;
}

interface CartProps {
    items: CartItem[];
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onRemove: (productId: number) => void;
    onUpdateExtra: (productId: number, extra: number) => void;
    total: number;
    onCheckout: () => void;
    loading: boolean
}

export default function Cart({
    items,
    onUpdateQuantity,
    onRemove,
    onUpdateExtra,
    total,
    onCheckout,
    loading,
}: CartProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between border border-gray-200" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">السلة</h2>
                {items.length === 0 && (
                    <p className="text-gray-500 text-center">لا توجد منتجات في السلة.</p>
                )}
                {items.map((item) => (
                    <div
                        key={item.product.id}
                        className="flex flex-col gap-2 mb-4 border-b border-gray-200 pb-4"
                    >
                        {/* Product Info */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-gray-900">{item.product.name}</p>
                                <p className="text-sm text-gray-500">
                                    السعر: {item.product.price} ج.م
                                </p>
                                {item.extraAmount && item.extraAmount > 0 && (
                                    <p className="text-sm text-green-600">
                                        + إضافي: {item.extraAmount} ج.م
                                    </p>
                                )}
                            </div>

                            {/* Quantity & Remove */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        onUpdateQuantity(item.product.id, item.quantity - 1)
                                    }
                                >
                                    -
                                </Button>
                                <span className="font-medium">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        onUpdateQuantity(item.product.id, item.quantity + 1)
                                    }
                                >
                                    +
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => onRemove(item.product.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Extra Amount */}
                        <div>
                            <Input
                                type="number"
                                placeholder="أضف قيمة إضافية"
                                className="w-32"
                                min="0"
                                value={item.extraAmount || ""}
                                onChange={(e) =>
                                    onUpdateExtra(
                                        item.product.id,
                                        parseFloat(e.target.value) || 0
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Total & Checkout */}
            <div className="mt-6">
                <div className="flex justify-between font-bold text-xl mb-4 text-gray-900">
                    <span>الإجمالي:</span>
                    <span>{total} ج.م</span>
                </div>
                <Button
                    onClick={onCheckout}
                    disabled={items.length === 0 || loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-semibold py-3 rounded-lg"
                >
                    {loading ? "جارٍ المعالجة..." : "إتمام الدفع"}
                </Button>
            </div>
        </div>
    );
}
