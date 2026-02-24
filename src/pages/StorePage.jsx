import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import usePagination from "../hooks/usePagination";
import { PaginationControls } from "../components/PaginationControls";
import { getUser } from "../auth";
import { LoadingSkeleton, DetailPageSkeleton } from "../components/LoadingSkeleton";
import { InlineError, EmptyState } from "../components/ErrorState";

const StorePage = () => {
  const { id } = useParams();

  const [store, setStore] = useState(null);
  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const [storeError, setStoreError] = useState(null);

  // Pagination for products
  const productsPagination = usePagination(
    async (params) => {
      const response = await api.get(`/api/stores/${id}/products`, { params });
      return response.data;
    },
    20
  );

  const user = getUser();
  const isOwner = user && store && String(store.ownerId) === String(user._id);

  const getStore = async () => {
    try {
      setIsLoadingStore(true);
      setStoreError(null);
      const res = await api.get(`/api/stores/${id}`);
      setStore(res.data);
    } catch (err) {
      console.error("Error fetching store:", err);
      setStoreError(err);
    } finally {
      setIsLoadingStore(false);
    }
  };

  const deleteProduct = async (productId) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await api.delete(`/api/products/${productId}`);
      toast.success("Product deleted");
      productsPagination.fetch(productsPagination.currentPage); // refresh list
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Delete failed";
      toast.error(msg);
    }
  };

  useEffect(() => {
    getStore();
    productsPagination.fetch(1);
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
        <DetailPageSkeleton />
      ) : storeError ? (
        <InlineError 
          error={storeError}
          onRetry={getStore}
        />
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
            {isOwner && (
              <div className="mt-3">
                <Link
                  to={`/stores/${id}/edit`}
                  className="inline-block bg-gray-700 text-white rounded-sm px-4 py-2 font-bold hover:bg-gray-600"
                >
                  Edit Store
                </Link>
              </div>
            )}
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

      {productsPagination.isLoading ? (
        <LoadingSkeleton count={4} variant="product" />
      ) : productsPagination.error ? (
        <InlineError 
          error={productsPagination.error}
          onRetry={() => productsPagination.fetch(productsPagination.currentPage)}
        />
      ) : productsPagination.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {productsPagination.data.map((product) => (
              <div key={product._id} className="bg-white rounded shadow-lg overflow-hidden">
                {product.image ? (
                  <img src={product.image} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-gray-200" />
                )}
                <div className="px-4 pt-2 pb-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="text-sm">Quantity: {product.quantity}</div>
                  {isOwner && (
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/stores/${id}/products/${product._id}/edit`}
                        className="w-full text-center shadow-md text-sm bg-gray-700 text-white rounded-sm px-4 py-1 font-bold hover:bg-gray-600 hover:cursor-pointer"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="w-full text-center shadow-md text-sm bg-red-700 text-white rounded-sm px-4 py-1 font-bold hover:bg-red-600 hover:cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {productsPagination.totalPages > 1 && (
            <PaginationControls
              currentPage={productsPagination.currentPage}
              totalPages={productsPagination.totalPages}
              onPrevious={productsPagination.prevPage}
              onNext={productsPagination.nextPage}
              onGoToPage={productsPagination.goToPage}
              isLoading={productsPagination.isLoading}
            />
          )}
        </>
      ) : (
        <EmptyState 
          title="No products yet"
          message="This store hasn't added any products yet."
          icon="inbox"
        />
      )}
    </div>
  );
};

export default StorePage;
