import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import usePagination from "../hooks/usePagination";
import { PaginationControls } from "../components/PaginationControls";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { InlineError, EmptyState } from "../components/ErrorState";

const HomePage = () => {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");

  const [searchStores, setSearchStores] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [useGeo, setUseGeo] = useState(false);
  const [geoLat, setGeoLat] = useState(null);
  const [geoLng, setGeoLng] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [geoError, setGeoError] = useState("");

  // Pagination for stores
  const storesPageination = usePagination(
    async (params) => {
      const response = await api.get("/api/stores", { params });
      return response.data;
    },
    20
  );

  useEffect(() => {
    storesPageination.fetch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSearch = () => {
    setQ("");
    setLocation("");
    setIsSearchMode(false);
    setSearchStores([]);
    setSearchProducts([]);
    setUseGeo(false);
    setGeoLat(null);
    setGeoLng(null);
    setGeoError("");
    setRadiusKm(10);
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
      setSearchError(null);

      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (location.trim()) params.set("location", location.trim());

      if (useGeo && geoLat != null && geoLng != null) {
        params.set("lat", String(geoLat));
        params.set("lng", String(geoLng));
        params.set("radiusKm", String(radiusKm));
      }

      const res = await api.get(`/api/search?${params.toString()}`);

      setSearchStores(res.data.stores || []);
      setSearchProducts(res.data.data || []);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError(err);
    } finally {
      setIsSearching(false);
    }
  };

  const getMyLocation = () => {
    setGeoError("");

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLat(pos.coords.latitude);
        setGeoLng(pos.coords.longitude);
        setUseGeo(true);
      },
      (err) => {
        setUseGeo(false);
        setGeoLat(null);
        setGeoLng(null);

        if (err.code === 1) setGeoError("Location permission denied.");
        else if (err.code === 2) setGeoError("Position unavailable.");
        else setGeoError("Could not get your location.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return(
    <div>
      {/* <h1 className="text-2xl font-bold mt-4">Stores</h1> */}
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
          <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3">
            <button
              type="button"
              onClick={getMyLocation}
              className="md:w-auto bg-gray-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-gray-600"
            >
              Use My Location
            </button>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              Radius
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="border rounded p-2"
                disabled={!useGeo}
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </label>

            {useGeo && geoLat != null && geoLng != null && (
              <div className="text-xs text-gray-600">
                Using location: {geoLat.toFixed(4)}, {geoLng.toFixed(4)}
              </div>
            )}

            {geoError && <div className="text-xs text-red-600">{geoError}</div>}
          </div>
        </div>
      </form>

      {isSearchMode && (
        <div className="mt-6">
          {searchError && (
            <InlineError
              error={searchError}
              onRetry={runSearch}
              onDismiss={() => setSearchError(null)}
            />
          )}

          <h2 className="text-xl font-semibold">Store Results</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 mt-4">
            {isSearching ? (
              <LoadingSkeleton count={3} variant="store" />
            ) : searchStores.length > 0 ? (
              searchStores.map((store) => (
                <div key={store._id} className="relative pt-12">
                  {/* roof */}
                  <svg
                    className="absolute top-0 left-0 w-full h-12 z-10"
                    viewBox="0 0 200 48"
                    preserveAspectRatio="none"
                    overflow="visible"
                    aria-hidden="true"
                  >
                    <polygon
                      points="0,48 100,0 200,48"
                      fill="white"
                      stroke="#d1d5db"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  <Link
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
                </div>
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
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 mt-5">
            {storesPageination.isLoading ? (
              <LoadingSkeleton count={6} variant="store" />
            ) : storesPageination.error ? (
              <InlineError
                error={storesPageination.error}
                onRetry={() => storesPageination.fetch(storesPageination.currentPage)}
              />
            ) : storesPageination.data.length > 0 ? (
              storesPageination.data.map((store) => (
                <div key={store._id} className="relative pt-12">
                  {/* roof */}
                  <svg
                    className="absolute top-0 left-0 w-full h-12 z-10"
                    viewBox="0 0 200 48"
                    preserveAspectRatio="none"
                    overflow="visible"
                    aria-hidden="true"
                  >
                    <polygon
                      points="0,48 100,0 200,48"
                      fill="white"
                      stroke="#d1d5db"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <Link
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
                </div>
              ))
            ) : (
              <EmptyState
                title="No stores available"
                message="There are currently no stores. Create one to get started!"
                action={
                  <Link
                    to="/stores/create"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create a Store
                  </Link>
                }
              />
            )}
          </div>

          {storesPageination.totalPages > 1 && (
            <PaginationControls
              currentPage={storesPageination.currentPage}
              totalPages={storesPageination.totalPages}
              onPrevious={storesPageination.prevPage}
              onNext={storesPageination.nextPage}
              onGoToPage={storesPageination.goToPage}
              isLoading={storesPageination.isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;