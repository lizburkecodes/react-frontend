import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { getUser } from "../auth";
import { validateDisplayName, validateLocation, validateImageUrl } from "../validation";

const EditStorePage = () => {
  const { id } = useParams(); // storeId
  const navigate = useNavigate();

  const user = getUser();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const [store, setStore] = useState(null);

  const [form, setForm] = useState({
    name: "",
    addressText: "",
    image: "",
  });
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [imageError, setImageError] = useState("");

  const loadStore = async () => {
    try {
      setIsLoadingStore(true);
      const res = await api.get(`/api/stores/${id}`);
      setStore(res.data);
      setForm({
        name: res.data.name || "",
        addressText: res.data.addressText || "",
        image: res.data.image || "",
      });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to load store";
      toast.error(msg);
    } finally {
      setIsLoadingStore(false);
    }
  };

  useEffect(() => {
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleNameChange = (value) => {
    setForm({ ...form, name: value });
    if (value) {
      setNameError(validateDisplayName(value) || "");
    } else {
      setNameError("");
    }
  };

  const handleAddressChange = (value) => {
    setForm({ ...form, addressText: value });
    if (value) {
      setAddressError(validateLocation(value) || "");
    } else {
      setAddressError("");
    }
  };

  const handleImageChange = (value) => {
    setForm({ ...form, image: value });
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

  const isOwner = user && store && String(store.ownerId) === String(user._id);

  const updateStore = async (e) => {
    e.preventDefault();

    const nameErr = validateDisplayName(form.name);
    const addressErr = validateLocation(form.addressText);
    const imageErr = form.image ? validateImageUrl(form.image) : null;

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
      const res = await api.put(`/api/stores/${id}`, {
        name: form.name.trim(),
        addressText: form.addressText.trim(),
        image: form.image.trim(),
      });

      toast.success(`Updated ${res.data.name}`);
      navigate(`/stores/${id}`);
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
        <Link to={`/stores/${id}`} className="text-blue-700 hover:underline">
          ← Back to Store
        </Link>
      </div>

      <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-4">
        <h2 className="font-semibold text-2xl mb-4 block text-center">Edit Store</h2>

        {isLoadingStore ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : !store ? (
          <div className="text-center text-red-600">Store not found</div>
        ) : !user ? (
          <div className="text-center text-red-600">You must be logged in to edit a store.</div>
        ) : !isOwner ? (
          <div className="text-center text-red-600">
            You are not authorized to edit this store.
          </div>
        ) : (
          <form onSubmit={updateStore}>
            <div className="space-y-2">
              <div>
                <label htmlFor="name">Store Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 ${nameError ? "border-red-500 focus:border-red-500" : ""}`}
                  placeholder="Enter Store Name"
                />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>

              <div>
                <label htmlFor="addressText">Address (text)</label>
                <input
                  type="text"
                  value={form.addressText}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 ${addressError ? "border-red-500 focus:border-red-500" : ""}`}
                  placeholder="City, State ZIP"
                />
                {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
              </div>

              <div>
                <label htmlFor="image">Image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => handleImageChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 ${imageError ? "border-red-500 focus:border-red-500" : ""}`}
                  placeholder="Enter Image URL"
                />
                {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
              </div>

              <div>
                <button
                  className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 disabled:opacity-60"
                  type="submit"
                  disabled={isLoading || !!nameError || !!addressError || !!imageError}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Only the store owner can edit store details.
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditStorePage;