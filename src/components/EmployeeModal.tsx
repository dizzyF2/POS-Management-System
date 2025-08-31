import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Employee {
    id: number;
    name: string;
}

interface EmployeeModalProps {
    employees: Employee[];
    selectedEmployee: Employee | null;
    setSelectedEmployee: (emp: Employee | null) => void;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export default function EmployeeModal({
    employees,
    selectedEmployee,
    setSelectedEmployee,
    onClose,
    onConfirm,
    loading
}: EmployeeModalProps) {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const emp = employees.find(emp => emp.id === Number(e.target.value));
        setSelectedEmployee(emp || null);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white rounded-xl shadow-lg p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-red-600">
                        Select Employee
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Choose an Employee
                    </label>
                    <select
                        value={selectedEmployee?.id ?? ""}
                        onChange={handleSelectChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    >
                        <option value="">-- Select Employee --</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name}
                            </option>
                        ))}
                    </select>
                </div>

                <DialogFooter className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading || !selectedEmployee}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
