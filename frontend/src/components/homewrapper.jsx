import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Main from "./main";
import Home from "./home";

export default function HomeWrapper() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    fetch("/api/checkauth", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Not authenticated");
        }
      })
      .then((data) => {
        // Check if user is admin - if so, redirect to admin page
        if (data.user && data.user.isAdmin === true) {
          navigate("/adminmain");
          return;
        }
        // Regular user authenticated
        setIsAuth(true);
      })
      .catch(() => {
        setIsAuth(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

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
  }, [checkAuth]);

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
