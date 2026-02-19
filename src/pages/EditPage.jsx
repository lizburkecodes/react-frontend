import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const EditPage = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState({ name: "", quantity: "", location: "", image: "" });

  const getProduct = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      setProduct({ name: response.data.name, quantity: response.data.quantity, location: response.data.location, image: response.data.image });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  }

  const updateProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${id}`, product).then((response) => {
        console.log(response.data);
        toast.success(`Updated ${response.data.name} successfully!`);
        setIsLoading(false);
        navigate("/");
      });
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-6">
      <h2 className="font-semibold text-2xl mb-4 block text-center">
        Update Product
      </h2>
      {isLoading ? ("Loading...") : (<>
        <form onSubmit={updateProduct}>
          <div className="space-y-2">
            <div>
              <label htmlFor="name">Name</label>
              <input type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Enter Name" />
            </div>
            <div>
              <label htmlFor="quantity">Quantity</label>
              <input type="number" value={product.quantity} onChange={(e) => setProduct({ ...product, quantity: e.target.value })} className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Enter Quantity" />
            </div>
            <div>
              <label htmlFor="location">Location</label>
              <input type="text" value={product.location} onChange={(e) => setProduct({ ...product, location: e.target.value })} className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Enter Location" />
            </div>
            <div>
              <label htmlFor="image">Image URL</label>
              <input type="text" value={product.image} onChange={(e) => setProduct({ ...product, image: e.target.value })} className="w-full block border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Enter Image URL" />
            </div>
            <div>
              {!isLoading && (<button className="block w-full mt-6 bg-blue-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-blue-600 hover:cursor-pointer" type="submit">Update</button>)}
            </div>
          </div>
        </form>
      </>)}
    </div>
  );
}

export default EditPage;