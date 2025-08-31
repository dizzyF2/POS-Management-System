import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative w-full mb-4" dir="rtl">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            <Input
                type="text"
                placeholder="ابحث بالاسم أو الباركود..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition text-right"
            />
        </div>
    );
}
