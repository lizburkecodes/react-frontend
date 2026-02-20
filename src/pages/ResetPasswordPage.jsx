import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = useMemo(() => params.get("token") || "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Missing reset token. Please use the link from your email.");
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill out all fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/api/auth/reset-password", {
        token,
        newPassword,
      });

      toast.success("Password reset successful. Please log in.");
      navigate("/login");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Reset password failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-6">
      <h2 className="font-semibold text-2xl mb-4 block text-center">
        Reset Password
      </h2>

      {!token ? (
        <div className="text-center text-red-600">
          Missing reset token. Please use the link from your email.
          <div className="mt-4">
            <Link to="/forgot-password" className="text-blue-700 hover:underline">
              Request a new reset link
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="space-y-2">
            <div>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full block border p-3 text-gray-600 rounded"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onKeyDown={handleKeyDown}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full block border p-3 text-gray-600 rounded"
                placeholder="Confirm new password"
              />
            </div>

            <button
              className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Reset Password"}
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

export default ResetPasswordPage;