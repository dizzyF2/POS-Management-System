import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";



export default function LogoutButton({rotate}: {rotate: "left" | "right"}) {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
        >
            <LogOut size={18} className={`${rotate === "left" ? "rotate-180" : ""}`}/>
        </button>
    );
}