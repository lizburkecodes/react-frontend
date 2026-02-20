import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useImageSuggestion } from "../hooks/useImageSuggestion";

const CreateProductForStorePage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const {
    image,
    setImage,
    setImageLocked,
    suggested,
    suggestions,
    suggestIndex,
    isSuggesting,
    fetchSuggestedImage,
    chooseSuggestion,
  } = useImageSuggestion(name);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    // image is optional
    if (!name.trim() || quantity === "") {
      toast.error("Please fill out name and quantity.");
      return;
    }

    // If user didn't provide image, fall back to suggestion
    const finalImage = image.trim() || suggested?.imageUrl || "";

    try {
      setIsLoading(true);

      const res = await api.post(`/api/stores/${storeId}/products`, {
        name: name.trim(),
        quantity: Number(quantity),
        image: finalImage || undefined,
      });

      toast.success(`Saved ${res.data.name}!`);
      navigate(`/stores/${storeId}`);
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Failed to create product";
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
                onKeyDown={handleKeyDown}
                className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                placeholder="Enter Product Name"
              />
              <div className="text-xs text-gray-500 mt-1">
                {isSuggesting ? "Finding an image..." : "\u00A0"}
              </div>
            </div>

            <div>
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                placeholder="Enter Quantity"
              />
            </div>

            <div>
              <label htmlFor="image">Image URL (optional)</label>
              <input
                type="text"
                value={image}
                onChange={(e) => {
                  setImageLocked(true);
                  setImage(e.target.value);
                onKeyDown={handleKeyDown}
                }}
                className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400"
                placeholder="Paste an image URL OR use a suggestion"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fetchSuggestedImage(name, true)}
                  disabled={!name.trim() || isSuggesting}
                  className="bg-gray-100 border rounded px-3 py-2 text-sm hover:bg-gray-200 disabled:opacity-60"
                >
                  {isSuggesting ? "Suggesting..." : "Get image options"}
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-3 border rounded p-3">
                  <div className="text-sm font-semibold mb-2">Pick an image</div>

                  <div className="grid grid-cols-3 gap-2">
                    {suggestions.slice(0, 6).map((s, idx) => (
                      <button
                        type="button"
                        key={s.imageUrl}
                        onClick={() => chooseSuggestion(idx)}
                        className={`border rounded overflow-hidden ${idx === suggestIndex ? "ring-2 ring-blue-500" : ""
                          }`}
                        title="Use this image"
                      >
                        <img src={s.imageUrl} alt="Suggestion" className="w-full h-24 object-cover" />
                      </button>
                    ))}
                  </div>

                  {suggestions[suggestIndex]?.creditUrl && suggestions[suggestIndex]?.creditText && (
                    <div className="text-xs text-gray-500 mt-2">
                      <a
                        href={suggestions[suggestIndex].creditUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {suggestions[suggestIndex].creditText}
                      </a>
                    </div>
                  )}
                </div>
              )}
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