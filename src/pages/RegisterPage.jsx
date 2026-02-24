import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { setUser } from "../auth";
import { validateEmail, validatePassword, validateDisplayName, getPasswordStrengthIndicators } from "../validation";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate password strength - will update on every password change
  const passwordStrength = getPasswordStrengthIndicators(password);
  
  // Debug: log to console
  console.log('RegisterPage: password=', password, 'passwordStrength=', passwordStrength);

  const handleDisplayNameChange = (e) => {
    const value = e.target.value;
    setDisplayName(value);
    if (value) {
      setDisplayNameError(validateDisplayName(value) || "");
    } else {
      setDisplayNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setEmailError(validateEmail(value) || "");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      setPasswordError(validatePassword(value) || "");
    } else {
      setPasswordError("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Final validation
    const displayNameErr = validateDisplayName(displayName);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (displayNameErr) {
      setDisplayNameError(displayNameErr);
      return;
    }
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }
    if (passwordErr) {
      setPasswordError(passwordErr);
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        displayName,
        email,
        password,
      }, {
        // Enable sending/receiving cookies
        withCredentials: true,
      });

      // Save user data (token is in HttpOnly cookie, set automatically by server)
      setAuth({ user: res.data.user });

      toast.success(`Welcome, ${res.data.user.displayName}!`);
      navigate("/");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-6">
      <h2 className="font-semibold text-2xl mb-4 block text-center">Register</h2>

      <form onSubmit={handleRegister}>
        <div className="space-y-2">
          <div>
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={handleDisplayNameChange}
              onKeyDown={handleKeyDown}
              className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                displayNameError ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Enter Display Name"
            />
            {displayNameError && <p className="text-xs text-red-500 mt-1">{displayNameError}</p>}
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              value={email}
              onKeyDown={handleKeyDown}
              onChange={handleEmailChange}
              className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                emailError ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Enter Email"
              autoComplete="email"
            />
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
              className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                passwordError ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Create Password"
              autoComplete="new-password"
            />
            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
            
            {/* Password strength indicator - always show when user is typing */}
            {password && (
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
          </div>

          <div>
            <button
              className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 hover:cursor-pointer disabled:opacity-60"
              type="submit"
              disabled={isLoading || !!displayNameError || !!emailError || !!passwordError}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          <div className="text-sm mt-3 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
