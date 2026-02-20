import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { setAuth } from "../auth";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });

      // Save token for later API requests
      setAuth({ token: res.data.token, user: res.data.user });

      toast.success(`Welcome back, ${res.data.user.displayName}!`);
      navigate("/");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-6">
      <h2 className="font-semibold text-2xl mb-4 block text-center">Log In</h2>

      <form onSubmit={handleLogin}>
        <div className="space-y-2">
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
              placeholder="Enter Email"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
              placeholder="Enter Password"
              autoComplete="current-password"
            />
          </div>

          <div>
            <button
              className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 hover:cursor-pointer disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </div>

          <div className="text-sm mt-3 text-center">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-700 hover:underline">
              Register
            </Link>
          </div>
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
