import { useState } from "react";
import { LogOut, Package, Users, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductsPage from "../components/admin/ProductsPage";
import EmployeesPage from "../components/admin/EmployeesPage";
import ReportPage from "../components/admin/ReportPage";
import AdminSettingsPage from "../components/admin/AdminSettingsPage";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
    const [activePage, setActivePage] = useState<
        "products" | "employees" | "reports" | "settings"
    >("products");
    const navigate = useNavigate();

    const menuItems = [
        { key: "products", label: "Products", icon: Package },
        { key: "employees", label: "Employees", icon: Users },
        { key: "reports", label: "Reports", icon: BarChart3 },
        { key: "settings", label: "Settings", icon: Settings },
    ];

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 shadow-md flex flex-col">
                <div className="flex items-center p-5 border-b border-gray-200">
                    <img
                        src="/icons/restaurant-logo.jpeg"
                        alt="star damask logo"
                        className="w-14 h-14 mr-3"
                    />
                    <h1 className="text-lg font-bold text-red-600">Admin Panel</h1>
                </div>

                <nav className="flex-1 mt-6 space-y-2 px-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.key;
                        return (
                            <Button
                                key={item.key}
                                variant="ghost"
                                className={`w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                                    isActive
                                        ? "bg-red-500 text-white shadow-md"
                                        : "text-gray-700 hover:bg-red-100 hover:text-red-600"
                                }`}
                                onClick={() => setActivePage(item.key as any)}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2 rounded-lg shadow-md font-semibold"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {activePage === "products" && <ProductsPage />}
                {activePage === "employees" && <EmployeesPage />}
                {activePage === "reports" && <ReportPage />}
                {activePage === "settings" && <AdminSettingsPage />}
            </main>
        </div>
    );
}
