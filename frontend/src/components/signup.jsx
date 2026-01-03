// src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form"); // "form" or "otp"
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const addToCart = searchParams.get("addToCart");

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/signup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setStep("otp");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle verify OTP and complete signup
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otp }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Registration successful!");
        navigate(`/login${redirectTo && redirectTo !== "/" ? `?redirect=${redirectTo}${addToCart ? `&addToCart=${addToCart}` : ""}` : ""}`);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-green-600 dark:to-emerald-600 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
            {step === "form" ? "Create Account" : "Verify Email"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {step === "form" ? "Join us and start shopping today" : "Enter the code sent to your email"}
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/80 dark:bg-gray-950/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 space-y-6">
          {step === "form" ? (
            <form className="space-y-5" onSubmit={handleSendOTP}>
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:bg-[#047857] dark:hover:bg-[#065f46] text-white font-semibold py-3.5 rounded-xl shadow-lg dark:shadow-[0_4px_14px_0_rgba(4,120,87,0.4)] hover:shadow-xl dark:hover:shadow-[0_8px_24px_0_rgba(4,120,87,0.6)] transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Up</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerifyOTP}>
              {/* OTP Verification Section */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-2">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formData.email}</p>
              </div>

              {/* OTP Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-center block">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  name="otp"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-green-500 focus:border-indigo-500 dark:focus:border-green-500 transition-all outline-none text-gray-900 dark:text-gray-100"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:bg-[#047857] dark:hover:bg-[#065f46] text-white font-semibold py-3.5 rounded-xl shadow-lg dark:shadow-[0_4px_14px_0_rgba(4,120,87,0.4)] hover:shadow-xl dark:hover:shadow-[0_8px_24px_0_rgba(4,120,87,0.6)] transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verify & Register</span>
                  </>
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setOtp("");
                }}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to form
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to={`/login${redirectTo && redirectTo !== "/" ? `?redirect=${redirectTo}${addToCart ? `&addToCart=${addToCart}` : ""}` : ""}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-green-400 transition-colors"
            >
              Sign in instead
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
