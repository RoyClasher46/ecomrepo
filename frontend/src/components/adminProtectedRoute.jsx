import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/admin/checkauth", {
            credentials: "include",
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error("Not authenticated as admin");
            }
        })
        .then(data => {
            if (data.isAdmin) {
                setIsAuth(true);
            } else {
                // Normal users should be redirected to main login page, not admin login
                navigate("/login");
            }
        })
        .catch(err => {
            console.error(err);
            // If not authenticated or not admin, redirect to main login
            navigate("/login");
        })
        .finally(() => {
            setLoading(false);
        });
    }, [navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="modern-card p-8 rounded-lg">
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );

    return isAuth ? children : null;
}

