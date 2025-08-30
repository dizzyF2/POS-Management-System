import LogoutButton from "./LogoutButton";

export default function Header() {
    return (
        <header className="flex justify-between items-center bg-amber-50 shadow px-6 py-3">
            <div className="flex items-center space-x-3">
                <img
                    src="/icons/Coffee-Cup.jpg"
                    alt="Layal Cafe"
                    className="w-10 h-10 rounded-full"
                />
                <h1 className="text-xl font-bold text-amber-900">Layal Cafe</h1>
            </div>
            <LogoutButton rotate="right"/>
        </header>
    );
}