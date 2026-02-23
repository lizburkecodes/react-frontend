import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { validateProductName, validateLocation, validateImageUrl } from "../validation";

const CreateStorePage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [addressText, setAddressText] = useState("");
  const [image, setImage] = useState("");
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value) {
      setNameError(validateProductName(value) || "");
    } else {
      setNameError("");
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddressText(value);
    if (value) {
      setAddressError(validateLocation(value) || "");
    } else {
      setAddressError("");
    }
  };

  const handleImageChange = (e) => {
    const value = e.target.value;
    setImage(value);
    if (value) {
      setImageError(validateImageUrl(value) || "");
    } else {
      setImageError("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const saveStore = async (e) => {
    e.preventDefault();

    const nameErr = validateProductName(name);
    const addressErr = validateLocation(addressText);
    const imageErr = image ? validateImageUrl(image) : null;

    if (nameErr) {
      setNameError(nameErr);
      return;
    }
    if (addressErr) {
      setAddressError(addressErr);
      return;
    }
    if (imageErr) {
      setImageError(imageErr);
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
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                  nameError ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Enter Store Name"
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>

            <div>
              <label htmlFor="addressText">Address</label>
              <input
                type="text"
                value={addressText}
                onKeyDown={handleKeyDown}
                onChange={handleAddressChange}
                className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                  addressError ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="e.g. Tampa, FL 33602"
              />
              {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
            </div>

            <div>
              <label htmlFor="image">Image URL (optional)</label>
              <input
                type="text"
                value={image}
                onKeyDown={handleKeyDown}
                onChange={handleImageChange}
                className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400 ${
                  imageError ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Enter Image URL"
              />
              {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
            </div>

            <div>
              <button
                className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 hover:cursor-pointer disabled:opacity-60"
                type="submit"
                disabled={isLoading || !!nameError || !!addressError || !!imageError}
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
