import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { getUser, clearAuth } from "../auth";
import { validatePassword, validatePasswordDifference, validatePasswordsMatch, getPasswordStrengthIndicators } from "../validation";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate password strength for new password
  const passwordStrength = getPasswordStrengthIndicators(newPassword);

  const handleCurrentPasswordChange = (e) => {
    const value = e.target.value;
    setCurrentPassword(value);
    if (value) {
      setCurrentPasswordError("");
    }
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    if (value) {
      const err = validatePassword(value);
      setNewPasswordError(err || "");
      // Also check if confirm password matches
      if (confirmNewPassword) {
        const matchErr = validatePasswordsMatch(value, confirmNewPassword);
        setConfirmPasswordError(matchErr || "");
      }
    } else {
      setNewPasswordError("");
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmNewPassword(value);
    if (value) {
      const matchErr = validatePasswordsMatch(newPassword, value);
      setConfirmPasswordError(matchErr || "");
    } else {
      setConfirmPasswordError("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!currentPassword) {
      setCurrentPasswordError("Current password is required");
      return;
    }

    const newPasswordErr = validatePassword(newPassword);
    if (newPasswordErr) {
      setNewPasswordError(newPasswordErr);
      return;
    }

    const diffErr = validatePasswordDifference(currentPassword, newPassword);
    if (diffErr) {
      setNewPasswordError(diffErr);
      return;
    }

    const matchErr = validatePasswordsMatch(newPassword, confirmNewPassword);
    if (matchErr) {
      setConfirmPasswordError(matchErr);
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
              onChange={handleCurrentPasswordChange}
              className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 ${
                currentPasswordError ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Enter current password"
            />
            {currentPasswordError && <p className="text-xs text-red-500 mt-1">{currentPasswordError}</p>}
          </div>

          <div>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 ${
                newPasswordError ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Enter new password"
            />
            {/* Password strength indicator for new password */}
            {newPassword && (
              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(25 + (passwordStrength.score * 20), 100)}%`,
                        height: '100%'
                      }}
                      className={`rounded-full transition-all ${
                        passwordStrength.score === 0 ? 'bg-red-500' :
                        passwordStrength.score === 1 ? 'bg-orange-500' :
                        passwordStrength.score === 2 ? 'bg-yellow-500' :
                        passwordStrength.score === 3 ? 'bg-lime-500' :
                        'bg-green-500'
                      }`}
                    />
                  </div>
                  <span className="font-semibold capitalize text-sm text-gray-700 min-w-fit">{passwordStrength.label}</span>
                </div>
                <p className="text-xs text-gray-600">{passwordStrength.message}</p>
              </div>
            )}
            {newPasswordError && <p className="text-xs text-red-500 mt-1">{newPasswordError}</p>}
          </div>

          <div>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 ${
                confirmPasswordError ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Confirm new password"
            />
            {confirmPasswordError && <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>}
          </div>

          <div>
            <button
              className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 disabled:opacity-60"
              type="submit"
              disabled={isLoading || !currentPassword || !!newPasswordError || !!confirmPasswordError}
            >
              {isLoading ? "Saving..." : "Update Password"}
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Password must be at least 8 characters with a number and special character.
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;