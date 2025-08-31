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
}

export default function Cart({
    items,
    onUpdateQuantity,
    onRemove,
    onUpdateExtra,
    total,
    onCheckout,
}: CartProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between border border-gray-200">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart</h2>
                {items.length === 0 && (
                    <p className="text-gray-500 text-center">No items in cart.</p>
                )}
                {items.map((item) => (
                    <div
                        key={item.product.id}
                        className="flex flex-col gap-2 mb-4 border-b border-gray-200 pb-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-gray-900">{item.product.name}</p>
                                <p className="text-sm text-gray-500">
                                    Base: ${item.product.price.toFixed(2)}
                                </p>
                                {item.extraAmount && item.extraAmount > 0 && (
                                    <p className="text-sm text-green-600">
                                        + Extra: ${item.extraAmount.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                    onClick={() =>
                                        onUpdateQuantity(item.product.id, item.quantity + 1)
                                    }
                                >
                                    +
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => onRemove(item.product.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Input
                                type="number"
                                placeholder="Add Extra"
                                className="w-32 border-gray-300 focus:border-red-500"
                                min="0"
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

            <div className="mt-6">
                <div className="flex justify-between font-bold text-xl mb-4 text-gray-900">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <Button
                    onClick={onCheckout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-semibold py-3 rounded-lg"
                >
                    Checkout
                </Button>
            </div>
        </div>
    );
}
