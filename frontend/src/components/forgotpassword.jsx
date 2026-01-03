// src/components/ForgotPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Eye, EyeOff } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState("email"); // "email", "otp", "reset"
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setStep("otp");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP verified successfully!");
        setStep("reset");
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

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="modern-card p-8 rounded-lg shadow-large w-full max-w-md">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">
          {step === "email" && "Forgot Password"}
          {step === "otp" && "Verify OTP"}
          {step === "reset" && "Reset Password"}
        </h2>

        {step === "email" && (
          <form className="space-y-4" onSubmit={handleSendOTP}>
            <p className="text-sm text-gray-600 text-center mb-4">
              Enter your registered email address and we'll send you an OTP to reset your password.
            </p>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modern-input"
              required
            />
            <button
              type="submit"
              className="w-full modern-button py-3 rounded-lg"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form className="space-y-4" onSubmit={handleVerifyOTP}>
            <p className="text-sm text-gray-600 text-center mb-4">
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="modern-input text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
            <button
              type="submit"
              className="w-full modern-button py-3 rounded-lg"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
            >
              Back
            </button>
          </form>
        )}

        {step === "reset" && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <p className="text-sm text-gray-600 text-center mb-4">
              Enter your new password
            </p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="modern-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="modern-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full modern-button py-3 rounded-lg"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("otp");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
            >
              Back
            </button>
          </form>
        )}

        <p className="text-center mt-4 text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-primary font-semibold hover:text-primary-dark transition underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

