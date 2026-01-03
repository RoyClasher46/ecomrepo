import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Main from "./main";
import Home from "./home";

export default function HomeWrapper() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = () => {
    fetch("/api/checkauth", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      })
      .catch(() => {
        setIsAuth(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    checkAuth();

    // Re-check auth when window gains focus or page becomes visible (handles logout from other tab)
    const handleFocus = () => checkAuth();
    const handleVisibilityChange = () => {
      if (!document.hidden) checkAuth();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="modern-card p-8 rounded-lg">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuth ? <Main /> : <Home />;
}
