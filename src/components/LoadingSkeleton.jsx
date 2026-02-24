/**
 * Loading Skeleton Components
 * Displays placeholder UI while data is loading
 * Improves perceived performance and user experience
 */

/**
 * Generic skeleton loader with pulse animation
 */
export const Skeleton = ({ className = '' }) => (
  <div
    className={`bg-gray-200 animate-pulse rounded ${className}`}
  />
);

/**
 * Store Card Skeleton
 * Simulates the layout of a store card while loading
 */
export const StoreCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4 space-y-3">
    {/* Store image placeholder */}
    <Skeleton className="w-full h-40" />
    
    {/* Store name placeholder */}
    <Skeleton className="w-3/4 h-5" />
    
    {/* Store location placeholder */}
    <Skeleton className="w-full h-4" />
    <Skeleton className="w-full h-4" />
    
    {/* Button placeholders */}
    <div className="flex gap-2 mt-4">
      <Skeleton className="flex-1 h-10" />
      <Skeleton className="flex-1 h-10" />
    </div>
  </div>
);

/**
 * Product Card Skeleton
 * Simulates the layout of a product card while loading
 */
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-3 space-y-2">
    {/* Product image placeholder */}
    <Skeleton className="w-full h-32" />
    
    {/* Product name placeholder */}
    <Skeleton className="w-4/5 h-4" />
    
    {/* Product details placeholder */}
    <Skeleton className="w-full h-3" />
    <Skeleton className="w-3/5 h-3" />
    
    {/* Button placeholder */}
    <Skeleton className="w-full h-8 mt-2" />
  </div>
);

/**
 * List Loading Skeleton
 * Displays multiple skeleton items in a grid
 */
export const LoadingSkeleton = ({ count = 6, variant = 'store' }) => {
  const SkeletonComponent = variant === 'product' ? ProductCardSkeleton : StoreCardSkeleton;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};

/**
 * Single Item Loading Skeleton
 * For single item pages (store detail, product detail)
 */
export const DetailPageSkeleton = () => (
  <div className="max-w-2xl mx-auto">
    {/* Header section */}
    <div className="space-y-4 mb-8">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-6 w-1/2" />
    </div>

    {/* Main image */}
    <Skeleton className="w-full h-64 rounded-lg mb-8" />

    {/* Content sections */}
    <div className="space-y-6">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>

    {/* Action buttons */}
    <div className="flex gap-4 mt-8">
      <Skeleton className="flex-1 h-10" />
      <Skeleton className="flex-1 h-10" />
    </div>
  </div>
);

/**
 * Table Loading Skeleton
 * For displaying table/list data while loading
 */
export const TableLoadingSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            className="h-12 flex-1"
          />
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
