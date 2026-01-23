import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Main from "./main";
import Home from "./home";

export default function HomeWrapper() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is admin, they shouldn't be here - redirect to admin dashboard
    if (!loading && user && user.isAdmin === true) {
      navigate("/adminmain");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="modern-card p-8 rounded-lg">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a user (and not admin), show Main (Logged in home)
  // Otherwise show Home (Public landing page)
  return user ? <Main /> : <Home />;
}
