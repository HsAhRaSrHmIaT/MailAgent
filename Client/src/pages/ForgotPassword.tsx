import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { apiService } from "../services/apiService";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const { currentColors, currentPalette } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.forgotPassword(email);
      setEmailSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

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
            Forgot Password
          </h1>
          <p className="text-sm" style={{ color: currentColors.textSecondary }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: currentColors.text }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: currentColors.bg,
                  color: currentColors.text,
                  borderColor: currentColors.border,
                }}
                placeholder="your.email@example.com"
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
              {isLoading ? "Sending..." : "Send Reset Link"}
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
        ) : (
          <div className="text-center space-y-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: currentColors.bg }}
            >
              <p style={{ color: currentColors.text }}>
                A password reset link has been sent to <strong>{email}</strong>
              </p>
              <p
                className="text-sm mt-2"
                style={{ color: currentColors.textSecondary }}
              >
                Please check your email and follow the instructions to reset
                your password.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-block text-sm hover:underline"
              style={{ color: currentPalette.primary }}
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
