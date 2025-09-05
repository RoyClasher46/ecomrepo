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

    if (loading) return <div>Loading...</div>;

    return isAuth ? children : null;
}