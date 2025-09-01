import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import SearchBar from "../components/POS/SearchBar";
import ProductList from "../components/POS/ProductList";
import Cart from "../components/POS/Cart";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface Product {
    id: number;
    name: string;
    price: number;
    barcode: string;
}

interface CartItem {
    product: Product;
    quantity: number;
    extraAmount?: number;
}

export default function PosPage() {
    const { employeeId, employeeName } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await invoke<Product[]>("get_products_cmd");
                setProducts(res);
                setFilteredProducts(res);
            } catch (err) {
                console.error(err);
                setError("فشل تحميل المنتجات");
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        const query = search.toLowerCase();
        setFilteredProducts(
            products.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.barcode.toLowerCase().includes(query)
            )
        );
    }, [search, products]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const updateExtra = (productId: number, extra: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, extraAmount: extra } : item
            )
        );
    };

    const total = cart.reduce(
        (sum, item) =>
            sum + (item.product.price + (item.extraAmount || 0)) * item.quantity,
        0
    );

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("السلة فارغة");
            return;
        }

        if (!employeeId) {
            toast.error("لا يوجد موظف مسجل الدخول");
            return;
        }

        setCheckoutLoading(true);
        try {
            const saleId = await invoke<number>("start_sale_cmd", {
                employeeId,
            });

            for (const item of cart) {
                await invoke("add_sale_item_cmd", {
                    saleId,
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                    extraAmount: item.extraAmount || 0,
                    productName: item.product.name,
                });
            }

            toast.success("تمت عملية البيع بنجاح!");
            setCart([]);
        } catch (err) {
            console.error("Checkout failed:", err);
            toast.error("فشل إتمام العملية. يرجى المحاولة مرة أخرى.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="p-6 flex flex-col lg:flex-row gap-6">
                {/* Left Section */}
                <div className="flex-1 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 text-right">
                        عملية جديدة - <span className="text-red-600">نقطة البيع</span>
                    </h1>
                    <p className="text-sm text-gray-500 mb-4 text-right">
                        الموظف: <span className="font-semibold">{employeeName || "غير معروف"}</span>
                    </p>
                    <SearchBar value={search} onChange={setSearch} />
                    <div className="mt-6">
                        <ProductList
                            products={filteredProducts}
                            onAddToCart={addToCart}
                            loading={loading}
                            error={error}
                        />
                    </div>
                </div>

                {/* Cart Section */}
                <div className="w-full lg:w-96 bg-white shadow-md rounded-2xl border border-gray-200 p-6 flex-shrink-0">
                    <Cart
                        items={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                        onUpdateExtra={updateExtra}
                        total={total}
                        onCheckout={handleCheckout}
                        loading={checkoutLoading}
                    />
                </div>
            </div>
        </div>
    );
}
