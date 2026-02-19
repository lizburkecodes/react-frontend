import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";

const HomePage = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");

  const [searchStores, setSearchStores] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const getStores = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/stores");
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStores();
  }, []);

  const clearSearch = () => {
    setQ("");
    setLocation("");
    setIsSearchMode(false);
    setSearchStores([]);
    setSearchProducts([]);
  };

  const runSearch = async (e) => {
    e.preventDefault();

    // If both empty, exit search mode and show normal store list
    if (!q.trim() && !location.trim()) {
      setIsSearchMode(false);
      setSearchStores([]);
      setSearchProducts([]);
      return;
    }

    try {
      setIsSearching(true);
      setIsSearchMode(true);

      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (location.trim()) params.set("location", location.trim());

      const res = await api.get(`/api/search?${params.toString()}`);

      setSearchStores(res.data.stores || []);
      setSearchProducts(res.data.products || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mt-4">Stores</h1>
      <form onSubmit={runSearch} className="mt-4 bg-white rounded shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full block border p-3 text-gray-600 rounded"
            placeholder="Search products or store names (e.g. milk)"
          />

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full block border p-3 text-gray-600 rounded"
            placeholder="Location (e.g. Tampa)"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600"
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>

            <button
              type="button"
              onClick={clearSearch}
              className="w-full bg-gray-600 text-white rounded-sm px-4 py-2 font-bold hover:bg-gray-500"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
      {isSearchMode && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Store Results</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {searchStores.length > 0 ? (
              searchStores.map((store) => (
                <Link
                  key={store._id}
                  to={`/stores/${store._id}`}
                  className="block bg-white rounded shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  {store.image ? (
                    <img src={store.image} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-200" />
                  )}
                  <div className="px-4 pt-3 pb-4">
                    <h3 className="text-lg font-semibold">{store.name}</h3>
                    <div className="text-sm text-gray-700 mt-1">{store.addressText}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-gray-600 mt-2">No stores found.</div>
            )}
          </div>

          <h2 className="text-xl font-semibold mt-8">Product Results</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {searchProducts.length > 0 ? (
              searchProducts.map((p) => (
                <Link
                  key={p._id}
                  to={p.store?._id ? `/stores/${p.store._id}` : "#"}
                  className="block bg-white rounded shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  {p.image ? (
                    <img src={p.image} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gray-200" />
                  )}
                  <div className="px-4 pt-2 pb-4">
                    <h3 className="font-semibold">{p.name}</h3>
                    <div className="text-sm">Quantity: {p.quantity}</div>
                    {p.store ? (
                      <div className="text-xs text-gray-600 mt-1">
                        Store: {p.store.name} • {p.store.addressText}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 mt-1">Store: (unknown)</div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-gray-600 mt-2">No products found.</div>
            )}
          </div>
        </div>
      )}
      {!isSearchMode && (
        <div className="grid ...">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {isLoading ? (
              "Loading..."
            ) : stores.length > 0 ? (
              stores.map((store) => (
                <Link
                  key={store._id}
                  to={`/stores/${store._id}`}
                  className="block bg-white rounded shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  {store.image ? (
                    <img src={store.image} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-200" />
                  )}

                  <div className="px-4 pt-3 pb-4">
                    <h2 className="text-lg font-semibold">{store.name}</h2>
                    <div className="text-sm text-gray-700 mt-1">{store.addressText}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div>No stores available.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;