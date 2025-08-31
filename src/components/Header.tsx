import LogoutButton from "./LogoutButton";

export default function Header() {
    return (
        <header className="flex justify-between items-center bg-white shadow-md px-6 py-4">
            <div className="flex items-center gap-4">
                <img
                    src="/icons/restaurant-logo.jpeg"
                    alt="Star Damask Logo"
                    className="w-12 h-12 rounded-full border border-gray-200 shadow-sm"
                />
                <h1 className="text-2xl font-bold text-red-600 tracking-wide">
                    Star Damask
                </h1>
            </div>
            <LogoutButton rotate="right" />
        </header>
    );
}
