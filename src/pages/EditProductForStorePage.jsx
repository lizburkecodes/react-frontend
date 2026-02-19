import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const EditProductForStorePage = () => {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    quantity: 0,
    image: "",
  });

  const getProduct = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/products/${productId}`);
      setProduct({
        name: res.data.name || "",
        quantity: res.data.quantity ?? 0,
        image: res.data.image || "",
      });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to load product";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const updateProduct = async (e) => {
    e.preventDefault();

    if (!product.name || product.quantity === "" || product.quantity == null) {
      toast.error("Please enter name and quantity.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.put(`/api/products/${productId}`, {
        name: product.name,
        quantity: Number(product.quantity),
        image: product.image,
      });

      toast.success(`Updated ${res.data.name}`);
      navigate(`/stores/${storeId}`);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Update failed";
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
        <h2 className="font-semibold text-2xl mb-4 block text-center">Edit Product</h2>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={updateProduct}>
            <div className="space-y-2">
              <div>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                  placeholder="Enter Name"
                />
              </div>

              <div>
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={product.quantity}
                  onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
                  className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                  placeholder="Enter Quantity"
                />
              </div>

              <div>
                <label htmlFor="image">Image URL</label>
                <input
                  type="text"
                  value={product.image}
                  onChange={(e) => setProduct({ ...product, image: e.target.value })}
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
                  {isLoading ? "Updating..." : "Update"}
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Note: Only the store owner can edit products.
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProductForStorePage;