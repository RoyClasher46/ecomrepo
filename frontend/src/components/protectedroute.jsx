import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/api/checkauth", {
            credentials: "include",
        })
        .then(res => {
            if (res.ok) {
                setIsAuth(true);
            } else {
                navigate("/login");
            }
        })
        .catch(err => {
            console.error(err);
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