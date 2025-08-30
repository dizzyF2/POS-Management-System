import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type UserRole = "employee" | "admin" | null;

interface AuthContextType {
    role: UserRole;
    login: (role: "employee" | "admin") => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<UserRole>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setRole(parsed.role);
        }
    }, []);

    const login = (role: "employee" | "admin") => {
        setRole(role);
        localStorage.setItem("user", JSON.stringify({ role }));
    };

    const logout = () => {
        setRole(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}