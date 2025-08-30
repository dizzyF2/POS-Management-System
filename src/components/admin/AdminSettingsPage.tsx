import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
    const [oldPassword, setOldPassword] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleVerifyOldPassword = async () => {
        if (!oldPassword) {
            setMessage("Please enter your old password");
            return;
        }
        setLoading(true);
        try {
            const isValid = await invoke<boolean>("verify_old_password_cmd", { oldPassword });
            if (isValid) {
                setIsVerified(true);
                setMessage("Password verified. You can now update your credentials.");
            } else {
                setMessage("Incorrect password");
            }
        } catch {
            setMessage("Error verifying old password");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!newName || !newPassword || !confirmPassword) {
            setMessage("Please fill in all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match");
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
                setMessage("Admin credentials updated successfully");
                resetForm();
            } else {
                setMessage("Failed to update admin. Old password might be incorrect.");
            }
        } catch {
            setMessage("Error updating admin");
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
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card className="shadow-lg border border-red-200">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-red-700">Admin Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {message && (
                        <p className="text-sm text-center font-medium text-green-700 bg-green-50 p-2 rounded">
                            {message}
                        </p>
                    )}
                    {!isVerified ? (
                        <div className="flex flex-col gap-4">
                            <Input
                                type="password"
                                placeholder="Enter Current Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <Button
                                onClick={handleVerifyOldPassword}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                            >
                                {loading ? "Verifying..." : "Verify Password"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Input
                                type="text"
                                placeholder="New Name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <Input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                >
                                    {loading ? "Updating..." : "Update"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={resetForm}
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
