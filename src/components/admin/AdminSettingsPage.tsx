import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
    const [oldPassword, setOldPassword] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

    const handleVerifyOldPassword = async () => {
        if (!oldPassword) {
            setMessage("الرجاء إدخال كلمة المرور الحالية");
            setMessageType("error");
            return;
        }
        setLoading(true);
        try {
            const isValid = await invoke<boolean>("verify_old_password_cmd", { oldPassword });
            if (isValid) {
                setIsVerified(true);
                setMessage("تم التحقق من كلمة المرور. يمكنك الآن تحديث البيانات.");
                setMessageType("success");
            } else {
                setMessage("كلمة المرور غير صحيحة");
                setMessageType("error");
            }
        } catch {
            setMessage("حدث خطأ أثناء التحقق من كلمة المرور");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!newName || !newPassword || !confirmPassword) {
            setMessage("الرجاء ملء جميع الحقول");
            setMessageType("error");
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage("كلمات المرور غير متطابقة");
            setMessageType("error");
            return;
        }
        setLoading(true);
        try {
            const success = await invoke<boolean>("update_admin_cmd", {
                oldPassword,
                newName,
                newPassword,
            });
            if (success) {
                setMessage("تم تحديث بيانات المسؤول بنجاح");
                setMessageType("success");
                toast.success("تم التحديث بنجاح");
                resetForm();
            } else {
                setMessage("فشل في تحديث بيانات المسؤول. قد تكون كلمة المرور القديمة غير صحيحة.");
                setMessageType("error");
            }
        } catch {
            setMessage("حدث خطأ أثناء تحديث البيانات");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setOldPassword("");
        setNewName("");
        setNewPassword("");
        setConfirmPassword("");
        setIsVerified(false);
        setMessage("");
        setMessageType("");
    };

    return (
        <div className="p-6 max-w-2xl mx-auto" dir="rtl">
            <Card className="shadow-lg border border-red-200">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-red-700">إعدادات المسؤول</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {message && (
                        <p
                            className={`${
                                messageType === "success"
                                    ? "text-green-600 bg-green-50"
                                    : messageType === "error"
                                    ? "text-red-600 bg-red-50"
                                    : ""
                            } text-sm text-center font-medium p-2 rounded`}
                        >
                            {message}
                        </p>
                    )}
                    {!isVerified ? (
                        <div className="flex flex-col gap-4">
                            <Input
                                type="password"
                                placeholder="أدخل كلمة المرور الحالية"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value.toLocaleLowerCase())}
                                className="text-right"
                            />
                            <Button
                                onClick={handleVerifyOldPassword}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                            >
                                {loading ? "جار التحقق..." : "تحقق من كلمة المرور"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Input
                                type="text"
                                placeholder="الاسم الجديد"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value.toLocaleLowerCase())}
                                className="text-right"
                            />
                            <Input
                                type="password"
                                placeholder="كلمة المرور الجديدة"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value.toLocaleLowerCase())}
                                className="text-right"
                            />
                            <Input
                                type="password"
                                placeholder="تأكيد كلمة المرور"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value.toLocaleLowerCase())}
                                className="text-right"
                            />
                            <div className="flex gap-3 justify-end">
                                <Button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                >
                                    {loading ? "جار التحديث..." : "تحديث"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={resetForm}
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
