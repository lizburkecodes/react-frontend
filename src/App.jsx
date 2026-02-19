import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import StorePage from "./pages/StorePage";
import RegisterPage from "./pages/RegisterPage";
import CreateStorePage from "./pages/CreateStorePage";
import CreateProductForStorePage from "./pages/CreateProductForStorePage";
import EditProductForStorePage from "./pages/EditProductForStorePage";

const App = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <nav className="bg-gray-800">
        <div className="container mx-auto p-2 flex items-center justify-between">
          <Link to="/">
            <h2 className="text-white text-2xl font-bold">Free Store</h2>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-gray-200 text-sm hidden sm:inline">
                  Hi, {user.displayName}
                </span>

                <Link
                  to="/stores/create"
                  className="text-sm bg-blue-700 text-white rounded-sm px-3 py-1 font-bold hover:bg-blue-600"
                >
                  Create Store
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm bg-gray-600 text-white rounded-sm px-3 py-1 font-bold hover:bg-gray-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-white hover:underline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-blue-700 text-white rounded-sm px-3 py-1 font-bold hover:bg-blue-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="container mx-auto p-2 h-full">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/stores/create" element={<CreateStorePage />} />
          <Route path="/stores/:storeId/products/create" element={<CreateProductForStorePage />} />
          <Route path="/stores/:storeId/products/:productId/edit" element={<EditProductForStorePage />} />
          <Route path="/stores/:id" element={<StorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;