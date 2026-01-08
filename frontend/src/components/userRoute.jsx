import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * UserRoute - Blocks admins from accessing user-side pages
 * Redirects admins to admin panel, allows regular users and guests
 */
export default function UserRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
    const hasChecked = useRef(false);

    useEffect(() => {
        // Prevent multiple checks
        if (hasChecked.current) return;
        hasChecked.current = true;

        let isMounted = true;

        // Check if user is authenticated and if they're an admin
        fetch("/api/checkauth", {
            credentials: "include",
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                // Not authenticated - allow access (public routes)
                return { user: { isAdmin: false } };
            }
        })
        .then(data => {
            if (!isMounted) return;
            
            // If user is admin, redirect to admin panel
            if (data.user && data.user.isAdmin === true) {
                setIsAdmin(true);
                navigate("/adminmain", { replace: true });
            } else {
                // Regular user or guest - allow access
                setIsAdmin(false);
            }
        })
        .catch(err => {
            // Error checking auth - allow access (public routes)
            if (!isMounted) return;
            console.error("Auth check error:", err);
            setIsAdmin(false);
        })
        .finally(() => {
            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="modern-card p-8 rounded-lg">
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );

    // If admin, don't render (redirect is happening)
    if (isAdmin) return null;

    // Regular user or guest - render the page
    return children;
}
