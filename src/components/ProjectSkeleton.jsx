const ProjectSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="h-8 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);

// Use in main component when loading
{isLoading && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <ProjectSkeleton key={i} />
    ))}
  </div>
)} 