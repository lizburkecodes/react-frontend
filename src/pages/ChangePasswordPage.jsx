import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { getUser, clearAuth } from "../auth";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill out all fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      await api.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully. Please log in again.");
      clearAuth();

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      navigate("/login");
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Password change failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-6">
        <h2 className="font-semibold text-2xl mb-4 block text-center">
          Change Password
        </h2>
        <div className="text-center text-red-600">
          You must be logged in to change your password.
        </div>
        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-700 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-6">
      <h2 className="font-semibold text-2xl mb-4 block text-center">
        Change Password
      </h2>

      <form onSubmit={submit}>
        <div className="space-y-2">
          <div>
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full block border p-3 text-gray-600 rounded"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full block border p-3 text-gray-600 rounded"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full block border p-3 text-gray-600 rounded"
              placeholder="Confirm new password"
            />
          </div>

          <div>
            <button
              className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Update Password"}
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Tip: Use at least 8 characters.
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;