import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const CreateProductForStorePage = () => {
  const { storeId } = useParams(); // storeId
  const navigate = useNavigate();

  const [store, setStore] = useState(null);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(false);

  const getStore = async () => {
    try {
      setIsLoadingStore(true);
      const res = await api.get(`/api/stores/${storeId}`);
      setStore(res.data);
    } catch (error) {
      toast.error("Could not load store.");
    } finally {
      setIsLoadingStore(false);
    }
  };

  useEffect(() => {
    getStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const saveProduct = async (e) => {
    e.preventDefault();

    if (!name || quantity === "" || !image) {
      toast.error("Please fill out name, quantity, and image.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.post(`/api/stores/${storeId}/products`, {
        name,
        quantity: Number(quantity),
        image,
      });

      toast.success(`Saved ${res.data.name}!`);
      navigate(`/stores/${storeId}`);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create product";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-4">
        <Link to={`/stores/${storeId}`} className="text-blue-700 hover:underline">
          ← Back to Store
        </Link>
      </div>

      <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-4">
        <h2 className="font-semibold text-2xl mb-1 block text-center">Add Product</h2>

        {isLoadingStore ? (
          <div className="text-center text-sm text-gray-600">Loading store...</div>
        ) : store ? (
          <div className="text-center text-sm text-gray-600 mb-4">
            for <span className="font-semibold">{store.name}</span>
          </div>
        ) : (
          <div className="text-center text-sm text-red-600 mb-4">Store not found</div>
        )}

        <form onSubmit={saveProduct}>
          <div className="space-y-2">
            <div>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                placeholder="Enter Product Name"
              />
            </div>

            <div>
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                placeholder="Enter Quantity"
              />
            </div>

            <div>
              <label htmlFor="image">Image URL</label>
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
                {isLoading ? "Saving..." : "Save Product"}
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              Note: You must be logged in as the store owner to add products.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductForStorePage;
