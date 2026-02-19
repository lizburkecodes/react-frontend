import { Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CreatePage from "./pages/CreatePage";
import EditPage from "./pages/EditPage";
import StorePage from "./pages/StorePage";
import RegisterPage from "./pages/RegisterPage";
import CreateStorePage from "./pages/CreateStorePage";

const App = () => {
  return (
    <div>
      <nav className="bg-gray-800">
        <div className="container mx-auto p-2">
          <Link to="/"><h2 className="text-white text-2xl font-bold">React App</h2></Link>
        </div>
      </nav>
      <div className="container mx-auto p-2 h-full">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/stores/create" element={<CreateStorePage />} />
          <Route path="/stores/:id" element={<StorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/edit/:id" element={<EditPage />} />
        </Routes>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;