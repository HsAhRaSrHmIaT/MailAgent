import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { apiService } from "../services/apiService";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { currentColors, currentPalette } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    // Verify token on mount
    const verifyToken = async () => {
      if (!token) {
        toast.error("Invalid reset link");
        setIsVerifying(false);
        return;
      }

      try {
        await apiService.verifyResetToken(token);
        setIsValidToken(true);
      } catch {
        toast.error("Invalid or expired reset link");
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.resetPassword(token, newPassword);
      toast.success("Password reset successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentColors.bg }}
      >
        <div className="text-center">
          <div
            className="flex flex-col items-center justify-center min-h-screen"
            style={{ backgroundColor: currentColors.bg }}
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div
                  className="w-16 h-16 border-4 rounded-full animate-spin"
                  style={{
                    borderColor: currentColors.border,
                    borderTopColor: `${currentColors.border}60`,
                  }}
                />
                <div
                  className="absolute inset-2 w-12 h-12 border-4 rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    borderColor: currentColors.border,
                    borderBottomColor: `${currentColors.border}60`,
                  }}
                />
              </div>
            </div>
          </div>
          <p style={{ color: currentColors.text }}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: currentColors.bg }}
      >
        <div
          className="w-full max-w-md p-8 rounded-2xl shadow-lg text-center border"
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
          }}
        >
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: currentColors.text }}
          >
            Invalid Reset Link
          </h1>
          <p className="mb-6" style={{ color: currentColors.textSecondary }}>
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-2 rounded-lg font-medium hover:opacity-90"
            style={{
              backgroundColor: currentPalette.primary,
              color: "#fff",
            }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: currentColors.bg }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-lg border"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
        }}
      >
        <div className="text-center mb-6">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: currentColors.text }}
          >
            Reset Password
          </h1>
          <p className="text-sm" style={{ color: currentColors.textSecondary }}>
            Enter your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentColors.text }}
            >
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: currentColors.bg,
                color: currentColors.text,
                borderColor: currentColors.border,
              }}
              placeholder="Enter new password"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: currentColors.text }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: currentColors.bg,
                color: currentColors.text,
                borderColor: currentColors.border,
              }}
              placeholder="Confirm new password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: currentPalette.primary,
              color: "#fff",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm hover:underline"
              style={{ color: currentPalette.primary }}
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
