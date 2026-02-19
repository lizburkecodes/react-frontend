import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

const StorePage = () => {
  const { id } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = user && store && String(store.ownerId) === String(user._id);

  const getStore = async () => {
    try {
      setIsLoadingStore(true);
      const res = await api.get(`/api/stores/${id}`);
      setStore(res.data);
    } catch (err) {
      console.error("Error fetching store:", err);
    } finally {
      setIsLoadingStore(false);
    }
  };

  const getProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const res = await api.get(`/api/stores/${id}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching store products:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    getStore();
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div>
      <div className="mt-4">
        <Link to="/" className="text-blue-700 hover:underline">
          ← Back to Stores
        </Link>
      </div>

      {isLoadingStore ? (
        <div className="mt-4">Loading store...</div>
      ) : store ? (
        <div className="bg-white rounded shadow-lg overflow-hidden mt-4">
          {store.image ? (
            <img src={store.image} className="w-full h-56 object-cover" />
          ) : (
            <div className="w-full h-56 bg-gray-200" />
          )}
          <div className="p-4">
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <div className="text-gray-700 mt-1">{store.addressText}</div>
          </div>
        </div>
      ) : (
        <div className="mt-4">Store not found.</div>
      )}

      <div className="flex items-center justify-between mt-6">
        <h2 className="text-xl font-semibold">Products</h2>

        {isOwner && (
          <Link
            to={`/stores/${id}/products/create`}
            className="text-sm bg-blue-700 text-white rounded-sm px-3 py-2 font-bold hover:bg-blue-600"
          >
            + Add Product
          </Link>
        )}
      </div>

      {isLoadingProducts ? (
        <div className="mt-3">Loading products...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded shadow-lg overflow-hidden">
              {product.image ? (
                <img src={product.image} className="w-full h-28 object-cover" />
              ) : (
                <div className="w-full h-28 bg-gray-200" />
              )}
              <div className="px-4 pt-2 pb-4">
                <h3 className="font-semibold">{product.name}</h3>
                <div className="text-sm">Quantity: {product.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3">No products in this store yet.</div>
      )}
    </div>
  );
};

export default StorePage;
