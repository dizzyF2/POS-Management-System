import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
    id: number;
    name: string;
    price: number;
    barcode: string;
}

interface ProductListProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    loading: boolean;
    error: string | null;
}

export default function ProductList({ products, onAddToCart, loading, error }: ProductListProps) {
    if (loading) return <p className="text-center text-red-600 font-medium">Loading products...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (products.length === 0) return <p className="text-gray-500 text-center">No products found.</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
                <Card
                    key={p.id}
                    className="bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-xl hover:bg-red-50 transition-all cursor-pointer group"
                    onClick={() => onAddToCart(p)}
                >
                    <CardHeader className="p-4">
                        <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                            {p.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex flex-col gap-2">
                        <p className="text-red-600 font-bold text-xl">${p.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Barcode: {p.barcode}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
