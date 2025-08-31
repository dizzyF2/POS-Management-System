import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative w-full mb-4">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <Input
                type="text"
                placeholder="Search by name or barcode..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
            />
        </div>
    );
}
