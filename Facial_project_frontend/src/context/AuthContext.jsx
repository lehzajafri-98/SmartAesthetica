import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API = "http://localhost:8000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // On mount, verify stored token
    useEffect(() => {
        if (token) {
            fetch(`${API}/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => (r.ok ? r.json() : Promise.reject()))
                .then((data) => setUser(data.user))
                .catch(() => {
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const signup = async (name, email, password) => {
        const res = await fetch(`${API}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Signup failed");
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const login = async (email, password) => {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const upgrade = async (plan) => {
        const res = await fetch(`${API}/upgrade`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Upgrade failed");

        // Update local state and storage with new token and user data
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, upgrade }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
