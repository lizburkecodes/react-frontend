import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const CreateStorePage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [addressText, setAddressText] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const saveStore = async (e) => {
    e.preventDefault();

    if (!name || !addressText) {
      toast.error("Please enter a store name and address.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post("/api/stores", {
        name,
        addressText,
        image,
        // geo optional for now
      });

      toast.success(`Created "${res.data.name}"`);
      navigate(`/stores/${res.data._id}`);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create store";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-4">
        <Link to="/" className="text-blue-700 hover:underline">
          ← Back to Stores
        </Link>
      </div>

      <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-4">
        <h2 className="font-semibold text-2xl mb-4 block text-center">Create Store</h2>

        <form onSubmit={saveStore}>
          <div className="space-y-2">
            <div>
              <label htmlFor="name">Store Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                placeholder="Enter Store Name"
              />
            </div>

            <div>
              <label htmlFor="addressText">Address</label>
              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                placeholder="e.g. Tampa, FL 33602"
              />
            </div>

            <div>
              <label htmlFor="image">Image URL (optional)</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                placeholder="Enter Image URL"
              />
            </div>

            <div>
              <button
                className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 hover:cursor-pointer disabled:opacity-60"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Store"}
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              Note: You must be logged in to create a store.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStorePage;
