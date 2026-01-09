import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Main from "./main";
import Home from "./home";

export default function HomeWrapper() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    // First check sessionStorage for temp auth (set after login)
    const tempAuth = sessionStorage.getItem('tempAuth');
    if (tempAuth) {
      try {
        const authData = JSON.parse(tempAuth);
        // Check if temp auth is recent (within 5 seconds)
        if (Date.now() - authData.timestamp < 5000) {
          if (authData.isAdmin) {
            navigate("/adminmain");
            return;
          }
          setIsAuth(true);
          setLoading(false);
          // Still verify with backend, but don't wait
          fetch("/api/checkauth", { credentials: "include" })
            .then(res => {
              if (res.ok) {
                sessionStorage.removeItem('tempAuth'); // Remove temp auth once verified
              }
            })
            .catch(() => {});
          return;
        } else {
          // Temp auth expired, remove it
          sessionStorage.removeItem('tempAuth');
        }
      } catch (err) {
        sessionStorage.removeItem('tempAuth');
      }
    }
    
    // Normal auth check
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
        // Remove temp auth if backend auth succeeds
        sessionStorage.removeItem('tempAuth');
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
