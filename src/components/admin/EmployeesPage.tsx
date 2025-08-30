import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Trash2, Check, X, Edit3, PlusCircle } from "lucide-react";

type Employee = { id: number; name: string };

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [newEmployee, setNewEmployee] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        (async () => {
            await invoke("setup_employee_table").catch((e) =>
                console.error("setup_employee_table failed:", e)
            );
            await fetchEmployees();
        })();
    }, []);

    const fetchEmployees = async () => {
        try {
            const result = await invoke<Employee[]>("fetch_employees");
            setEmployees(result);
        } catch (e) {
            console.error("fetch_employees failed:", e);
        }
    };

    const addEmployee = async () => {
        if (!newEmployee.trim()) return;
        try {
            await invoke("add_new_employee", { name: newEmployee.trim() });
            setNewEmployee("");
            await fetchEmployees();
        } catch (e) {
            console.error("add_new_employee failed:", e);
        }
    };

    const startEdit = (emp: Employee) => {
        setEditingId(emp.id);
        setEditingName(emp.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEdit = async () => {
        if (editingId === null) return;
        try {
            await invoke("update_employee_cmd", { id: editingId, name: editingName.trim() });
            cancelEdit();
            await fetchEmployees();
        } catch (e) {
            console.error("update_employee_cmd failed:", e);
        }
    };

    const removeEmployee = async (id: number) => {
        try {
            await invoke("delete_employee_cmd", { id });
            await fetchEmployees();
        } catch (e) {
            console.error("delete_employee_cmd failed:", e);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="shadow-xl border border-red-200 rounded-2xl">
                <CardContent className="p-6 space-y-6">
                    <CardTitle className="text-3xl font-bold text-red-700 mb-4">
                        Manage Employees
                    </CardTitle>

                    {/* Add Employee */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            type="text"
                            placeholder="Enter employee name"
                            value={newEmployee}
                            onChange={(e) => setNewEmployee(e.target.value)}
                            className="flex-1 border-red-300 focus:ring-2 focus:ring-red-500"
                        />
                        <Button
                            onClick={addEmployee}
                            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                        >
                            <PlusCircle size={18} /> Add
                        </Button>
                    </div>

                    {/* Employee Table */}
                    <div className="overflow-x-auto">
                        <Table className="border border-red-100 rounded-lg">
                            <TableHeader>
                                <TableRow className="bg-red-50 hover:bg-red-50">
                                    <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                                    <TableHead className="text-right pr-10 text-gray-700 font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((e) => (
                                    <TableRow key={e.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            {editingId === e.id ? (
                                                <Input
                                                    value={editingName}
                                                    onChange={(ev) => setEditingName(ev.target.value)}
                                                    className="w-full border-red-300 focus:ring-2 focus:ring-red-500"
                                                />
                                            ) : (
                                                <span className="font-medium text-gray-800">{e.name}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {editingId === e.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={saveEdit}
                                                        className="bg-green-600 hover:bg-green-500 text-white flex items-center gap-1 px-3 rounded"
                                                    >
                                                        <Check size={16} /> Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={cancelEdit}
                                                        className="flex items-center gap-1 px-3 rounded"
                                                    >
                                                        <X size={16} /> Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded"
                                                        onClick={() => startEdit(e)}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => removeEmployee(e.id)}
                                                        className="px-3 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {employees.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-gray-500 p-4">
                                            No employees found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
