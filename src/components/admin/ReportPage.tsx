import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type SaleDetail = {
    product_name: string;
    quantity: number;
    employee_name: string;
    total_price: number;
    timestamp: string;
};

type SalesReport = {
    total_sales: number;
    total_transactions: number;
    sales: SaleDetail[];
};

export default function ReportPage() {
    const [sales, setSales] = useState<SaleDetail[]>([]);
    const [totalSales, setTotalSales] = useState<number>(0);
    const [totalTransactions, setTotalTransactions] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    useEffect(() => {
        applyPreset("daily");
    }, []);

    const fetchReport = async (start?: string, end?: string) => {
        try {
        const result = await invoke<SalesReport>("get_report_cmd", {
            startDate: start || startDate || null,
            endDate: end || endDate || null,
        });

        if (result) {
            setSales(result.sales || []);
            setTotalSales(result.total_sales || 0);
            setTotalTransactions(result.total_transactions || 0);
        }
        } catch (err) {
        console.error("Failed to fetch report:", err);
        }
    };

    const formatCairoDateTime = (utcLike: string) => {
        try {
        const iso =
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(utcLike)
            ? utcLike.replace(" ", "T") + "Z"
            : utcLike;

        const d = new Date(iso);
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Africa/Cairo",
        }).format(d);
        } catch {
        return utcLike;
        }
    };

    const applyPreset = (type: "daily" | "weekly" | "monthly") => {
        const today = new Date();
        let start: Date;
        let end = new Date(today);

        if (type === "daily") {
        start = new Date(today);
        } else if (type === "weekly") {
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        } else {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        }

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        setStartDate(startStr);
        setEndDate(endStr);
        fetchReport(startStr, endStr);
    };

    return (
        <div className="p-4 md:p-6">
        <Card className="shadow-lg">
            <CardContent>
            <CardTitle className="text-2xl font-bold text-red-900 mb-6">
                Sales Report
            </CardTitle>

            {/* Preset Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Button
                variant="outline"
                className="border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
                onClick={() => applyPreset("daily")}
                >
                Daily
                </Button>
                <Button
                variant="outline"
                className="border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
                onClick={() => applyPreset("weekly")}
                >
                Weekly
                </Button>
                <Button
                variant="outline"
                className="border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
                onClick={() => applyPreset("monthly")}
                >
                Monthly
                </Button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                <label className="block text-sm mb-1 font-medium">Start Date</label>
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                </div>
                <div>
                <label className="block text-sm mb-1 font-medium">End Date</label>
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                </div>
                <Button
                onClick={() => fetchReport()}
                className="bg-red-700 hover:bg-red-800 text-white"
                >
                Apply
                </Button>
            </div>

            {/* Summary */}
            <div className="bg-red-50 p-4 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <p className="text-lg font-semibold text-red-900">
                Total Sales: ${totalSales}
                </p>
                <p className="text-lg font-semibold text-red-900">
                Total Transactions: {totalTransactions}
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow className="bg-red-100 hover:bg-red-100">
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.length > 0 ? (
                    sales.map((sale, index) => (
                        <TableRow key={index}>
                        <TableCell>{sale.product_name}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{sale.employee_name}</TableCell>
                        <TableCell>${sale.total_price}</TableCell>
                        <TableCell>{formatCairoDateTime(sale.timestamp)}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 p-4">
                        No data available yet
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
