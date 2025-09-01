import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Lock } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState<"employee" | "admin" | null>(null);
    const [adminName, setAdminName] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    const [employeeName, setEmployeeName] = useState("");
    const [employeePassword, setEmployeePassword] = useState("");

    useEffect(() => {
        invoke("setup_admin");
        invoke("setup_employee_table");
    }, []);

    // ✅ Admin Login
    const handleAdminLogin = async () => {
        try {
            const isValid = await invoke<boolean>("login_admin", {
                name: adminName,
                password: adminPassword,
            });

            if (isValid) {
                login({ role: "admin" });
                navigate("/admin");
            } else {
                toast.error("بيانات المدير غير صحيحة");
            }
        } catch {
            toast.error("حدث خطأ أثناء تسجيل الدخول");
        }
    };

    // ✅ Employee Login (fetch ID and Name)
    const handleEmployeeLogin = async () => {
        try {
            const employee = await invoke<{ id: number; name: string } | null>(
                "login_employee_cmd",
                {
                    name: employeeName,
                    password: employeePassword,
                }
            );

            if (employee && employee.id) {
                login({ role: "employee", employeeId: employee.id, employeeName: employee.name });
                navigate("/pos");
            } else {
                toast.error("بيانات الموظف غير صحيحة");
            }
        } catch (e) {
            console.error("error login: ", e);
            toast.error("حدث خطأ أثناء تسجيل الدخول");
        }
    };

    return (
        <div dir="rtl" className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white p-4">
            <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200 bg-white">
                <CardHeader className="flex flex-col items-center gap-3 text-center">
                    <img
                        src="/icons/restaurant-logo.jpeg"
                        alt="شعار المطعم"
                        className="w-36 h-20 rounded-md shadow-sm"
                    />
                    <h1 className="text-3xl font-extrabold text-red-600">النجم الدمشقي</h1>
                    <p className="text-sm text-gray-500">
                        {role === "admin"
                            ? "تسجيل الدخول كمدير"
                            : role === "employee"
                            ? "تسجيل الدخول كموظف"
                            : "اختر الدور للاستمرار"}
                    </p>
                </CardHeader>

                <CardContent>
                    {!role && (
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={() => setRole("employee")}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
                            >
                                موظف
                            </Button>
                            <Button
                                onClick={() => setRole("admin")}
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded-lg"
                            >
                                مدير
                            </Button>
                        </div>
                    )}

                    {role === "admin" && (
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="اسم المدير"
                                    value={adminName}
                                    onChange={(e) => setAdminName(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="كلمة المرور"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    )}

                    {role === "employee" && (
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="اسم الموظف"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="كلمة المرور"
                                    value={employeePassword}
                                    onChange={(e) => setEmployeePassword(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>

                {role && (
                    <CardFooter className="flex flex-col gap-3">
                        {role === "admin" && (
                            <Button
                                onClick={handleAdminLogin}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
                            >
                                تسجيل الدخول
                            </Button>
                        )}
                        {role === "employee" && (
                            <Button
                                onClick={handleEmployeeLogin}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
                            >
                                تسجيل الدخول
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setRole(null)}
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            رجوع
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
