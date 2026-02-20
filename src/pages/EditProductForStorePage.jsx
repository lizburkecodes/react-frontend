import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useImageSuggestion } from "../hooks/useImageSuggestion";

const EditProductForStorePage = () => {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    quantity: 0,
  });

  const {
    image,
    setImage,
    imageLocked,
    setImageLocked,
    suggested,
    suggestions,
    suggestIndex,
    isSuggesting,
    fetchSuggestedImage,
    chooseSuggestion,
    clearImage,
  } = useImageSuggestion(product.name);

  const getProduct = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/api/products/${productId}`);
      setProduct({
        name: res.data.name || "",
        quantity: res.data.quantity ?? 0,
      });
      // If there's an existing image, set it and lock it
      if (res.data.image) {
        setImage(res.data.image);
        setImageLocked(true);
      }
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    if (!product.name || product.quantity === "" || product.quantity == null) {
      toast.error("Please enter name and quantity.");
      return;
    }

    // If user didn't provide image, fall back to suggestion
    const finalImage = image.trim() || suggested?.imageUrl || "";

    try {
      setIsLoading(true);

      const res = await api.put(`/api/products/${productId}`, {
        name: product.name,
        quantity: Number(product.quantity),
        image: finalImage || undefined,
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
                  onKeyDown={handleKeyDown}
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
                <div className="text-xs text-gray-500 mt-1">
                  {isSuggesting ? "Finding an image..." : "\u00A0"}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fetchSuggestedImage(product.name, true)}
                    disabled={!product.name.trim() || isSuggesting}
                    className="bg-gray-100 border rounded px-3 py-2 text-sm hover:bg-gray-200 disabled:opacity-60"
                  >
                    {isSuggesting ? "Suggesting..." : "Get image options"}
                  </button>

                  {imageLocked && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="bg-gray-100 border rounded px-3 py-2 text-sm hover:bg-gray-200"
                    >
                      Clear image
                    </button>
                  )}
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
                          className={`border rounded overflow-hidden ${
                            idx === suggestIndex ? "ring-2 ring-blue-500" : ""
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