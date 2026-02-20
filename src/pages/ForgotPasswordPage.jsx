import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/api/auth/forgot-password", { email: email.trim() });
      setSent(true);
      toast.success("If that email exists, a reset link was sent.");
    } catch (error) {
      // Still show generic message (same reason as backend)
      toast.success("If that email exists, a reset link was sent.");
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-6">
      <h2 className="font-semibold text-2xl mb-4 block text-center">
        Forgot Password
      </h2>

      {sent ? (
        <div className="text-center text-gray-700">
          <p className="mb-4">
            If that email exists, a reset link has been sent.
          </p>
          <p className="text-sm text-gray-500">
            Check your inbox (and spam folder).
          </p>

          <div className="mt-6">
            <Link to="/login" className="text-blue-700 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="space-y-2">
            <div>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full block border p-3 text-gray-600 rounded"
                placeholder="Enter your email"
              />
            </div>

            <button
              className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-blue-700 hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;