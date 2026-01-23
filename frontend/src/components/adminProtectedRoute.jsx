import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in
                navigate("/login");
            } else if (user.isAdmin !== true) {
                // Logged in but not admin
                navigate("/");
            }
        }
    }, [user, loading, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <div className="modern-card p-8 rounded-lg">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-300">Verifying admin access...</p>
                </div>
            </div>
        </div>
    );

    // Render children only if user is logged in AND is admin
    return (user && user.isAdmin === true) ? children : null;
}

