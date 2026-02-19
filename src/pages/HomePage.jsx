import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";

const HomePage = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div>
      <h1 className="text-2xl font-bold mt-4">Stores</h1>

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
  );
};

export default HomePage;