import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useImageSuggestion } from "../hooks/useImageSuggestion";
import { validateProductName, validateQuantity, validateImageUrl } from "../validation";

const CreateProductForStorePage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [nameError, setNameError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [imageError, setImageError] = useState("");

  const [imageMode, setImageMode] = useState("url"); // "url" | "upload"
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

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
      console.error("Error loading store:", error);
      toast.error("Could not load store.");
    } finally {
      setIsLoadingStore(false);
    }
  };

  useEffect(() => {
    getStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value) {
      setNameError(validateProductName(value) || "");
    } else {
      setNameError("");
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    if (value !== "") {
      setQuantityError(validateQuantity(value) || "");
    } else {
      setQuantityError("");
    }
  };

  const handleImageChange = (e) => {
    const value = e.target.value;
    setImageLocked(true);
    setImage(value);
    if (value) {
      setImageError(validateImageUrl(value) || "");
    } else {
      setImageError("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setImageError("Only JPEG, PNG, GIF, and WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be under 5 MB");
      return;
    }
    setImageError("");
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const clearUploadFile = () => {
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadFile(null);
    setUploadPreview(null);
    setImageError("");
  };

  // Revoke object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadPreview]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    const nameErr = validateProductName(name);
    const quantityErr = validateQuantity(quantity);

    if (nameErr) {
      setNameError(nameErr);
      return;
    }
    if (quantityErr) {
      setQuantityError(quantityErr);
      return;
    }

    // Validate URL only in URL mode
    if (imageMode === "url") {
      const imageErr = image ? validateImageUrl(image) : null;
      if (imageErr) {
        setImageError(imageErr);
        return;
      }
    }

    try {
      setIsLoading(true);

      let finalImage = "";

      if (imageMode === "upload" && uploadFile) {
        const formData = new FormData();
        formData.append("image", uploadFile);
        const uploadRes = await api.post("/api/images/upload", formData);
        finalImage = uploadRes.data.imageUrl;
      } else if (imageMode === "url") {
        finalImage = image.trim() || suggested?.imageUrl || "";
      }

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
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                  nameError ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Enter Product Name"
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
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
                onChange={handleQuantityChange}
                onKeyDown={handleKeyDown}
                className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                  quantityError ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Enter Quantity"
              />
              {quantityError && <p className="text-xs text-red-500 mt-1">{quantityError}</p>}
            </div>

            <div>
              <label htmlFor="image">Image (optional)</label>

              {/* Mode Toggle */}
              <div className="flex border rounded overflow-hidden text-sm mb-3 mt-1">
                <button
                  type="button"
                  onClick={() => { setImageMode("url"); setImageError(""); }}
                  className={`flex-1 py-2 font-medium transition-colors ${
                    imageMode === "url"
                      ? "bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  URL / Pexels
                </button>
                <button
                  type="button"
                  onClick={() => { setImageMode("upload"); setImageError(""); }}
                  className={`flex-1 py-2 font-medium transition-colors ${
                    imageMode === "upload"
                      ? "bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Upload File
                </button>
              </div>

              {imageMode === "url" ? (
                <>
                  <input
                    type="text"
                    value={image}
                    onChange={handleImageChange}
                    onKeyDown={handleKeyDown}
                    className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                      imageError ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    placeholder="Paste an image URL OR use a suggestion below"
                  />
                  {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
                  <div className="text-xs text-gray-500 mt-1">
                    {isSuggesting ? "Finding an image..." : "\u00A0"}
                  </div>
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
                </>
              ) : (
                <>
                  <label
                    htmlFor="imageFile"
                    className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden ${
                      imageError ? "border-red-500" : "border-gray-300"
                    } ${uploadPreview ? "h-40" : "h-28"}`}
                  >
                    {uploadPreview ? (
                      <img src={uploadPreview} alt="Preview" className="h-full w-full object-contain p-1" />
                    ) : (
                      <div className="text-center p-4">
                        <div className="text-gray-500 text-sm">Click to choose an image</div>
                        <div className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP · max 5 MB</div>
                      </div>
                    )}
                  </label>
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
                  {uploadFile && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 truncate">{uploadFile.name}</span>
                      <button
                        type="button"
                        onClick={clearUploadFile}
                        className="text-xs text-red-500 ml-2 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <button
                className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 hover:cursor-pointer disabled:opacity-60"
                type="submit"
                disabled={isLoading || !!nameError || !!quantityError || !!imageError}
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