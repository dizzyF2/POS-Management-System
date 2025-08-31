import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import EmployeeModal from "../components/POS/EmployeeModal";
import SearchBar from "../components/POS/SearchBar";
import ProductList from "../components/POS/ProductList";
import Cart from "../components/POS/Cart";
import Header from "@/components/Header";
import toast from "react-hot-toast";

interface Product {
    id: number;
    name: string;
    price: number;
    barcode: string;
}

interface Employee {
    id: number;
    name: string;
}

interface CartItem {
    product: Product;
    quantity: number;
    extraAmount?: number;
}

export default function PosPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await invoke<Product[]>("get_products_cmd");
                setProducts(res);
                setFilteredProducts(res);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch products.");
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const res = await invoke<Employee[]>("fetch_employees");
                setEmployees(res);
            } catch (err) {
                console.error(err);
            }
        }
        fetchEmployees();
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

    const handleCheckoutClick = () => {
        if (cart.length === 0) {
            toast.error("السلة فارغة")
            return;
        }
        setShowModal(true);
    };

    const confirmCheckout = async () => {
        if (!selectedEmployee) {
            toast.error("يرجى اختيار موظف")
            return;
        }
        setCheckoutLoading(true);
        try {
            const saleId = await invoke<number>("start_sale_cmd", {
                employeeId: selectedEmployee.id,
                employeeName: selectedEmployee.name,
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

            toast.success("تمت عملية البيع بنجاح!")
            setCart([]);
            setShowModal(false);
            setSelectedEmployee(null);
        } catch (err) {
            console.error("Checkout failed. Please try again.")
            toast.error("فشل إتمام العملية. يرجى المحاولة مرة أخرى.")
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
                        onCheckout={handleCheckoutClick}
                    />
                </div>
            </div>

            {showModal && (
                <EmployeeModal
                    employees={employees}
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={setSelectedEmployee}
                    onClose={() => setShowModal(false)}
                    onConfirm={confirmCheckout}
                    loading={checkoutLoading}
                />
            )}
        </div>
    );
}
