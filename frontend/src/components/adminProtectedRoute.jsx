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
                navigate("/adminlogin");
            }
        })
        .catch(err => {
            console.error(err);
            navigate("/adminlogin");
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
