import { useEffect, useState } from "react";
import { LogOut, Package, Users, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductsPage from "../components/admin/ProductsPage";
import EmployeesPage from "../components/admin/EmployeesPage";
import ReportPage from "../components/admin/ReportPage";
import AdminSettingsPage from "../components/admin/AdminSettingsPage";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

export default function AdminPanel() {
    const [activePage, setActivePage] = useState<"products" | "employees" | "reports" | "settings" | null>(null);
    const [adminName, setAdminName] = useState<string>("admin");

    const navigate = useNavigate();

    const menuItems = [
        { key: "products", label: "المنتجات", icon: Package },
        { key: "employees", label: "الموظفين", icon: Users },
        { key: "reports", label: "التقارير", icon: BarChart3 },
        { key: "settings", label: "الإعدادات", icon: Settings },
    ];

    const fetchAdminName = async () => {
        try {
            const name = await invoke<string>("get_admin_name")
            setAdminName(name);
        } catch (error) {
            console.error("Failed to fetch admin name:", error)
        }
    };

    useEffect(() => {
        fetchAdminName();
    }, []);

    useEffect(() => {
        if (activePage === null) {
            fetchAdminName();
        }
    }, [activePage]);

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 shadow-md flex flex-col">
                <div 
                    className="flex items-center p-5 border-b border-gray-200 cursor-pointer"
                    onClick={() => setActivePage(null)}
                >
                    <img
                        src="/icons/restaurant-logo.jpeg"
                        alt="شعار المطعم"
                        className="w-14 h-14 mr-3"
                    />
                    <h1 className="text-lg font-bold text-red-600">لوحة التحكم</h1>
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
                        <span>تسجيل الخروج</span>
                    </Button>
                </div>
            </aside>

            {/* المحتوى الرئيسي */}
            <main className="flex-1 p-6 overflow-y-auto">
                {!activePage && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4 capitalize">
                            مرحباً، {adminName}!
                        </h2>
                        <p className="text-lg text-gray-600">
                            اختر خياراً من القائمة للبدء.
                        </p>
                    </div>
                )}
                {activePage === "products" && <ProductsPage />}
                {activePage === "employees" && <EmployeesPage />}
                {activePage === "reports" && <ReportPage />}
                {activePage === "settings" && <AdminSettingsPage />}
            </main>
        </div>
    );
}
