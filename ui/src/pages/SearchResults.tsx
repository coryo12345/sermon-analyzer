import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { getApiClient } from "../lib/api";
import { SermonCard } from "../components/SermonCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { RecordModel } from "pocketbase";

export function SearchResults() {
  const [sermons, setSermons] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const client = getApiClient();
  const ITEMS_PER_PAGE = 9;

  const isAdmin = client.authStore.record?.role === "admin";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("q") || "";
    setQuery(searchQuery);

    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery, 1);
    } else {
      setLoading(false);
      // Check if 'q' parameter exists at all
      if (urlParams.has("q")) {
        setError("Please enter a search term.");
      } else {
        setError("No search query provided. Please use the search box above.");
      }
    }
  }, [location.path]);

  const fetchSearchResults = async (searchQuery: string, page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const result = await client.collection("sermons").getList(page, ITEMS_PER_PAGE, {
        filter: `title ~ "${searchQuery}" || summary ~ "${searchQuery}"`,
        sort: "-date_given,-created",
      });

      if (page === 1) {
        setSermons(result.items);
      } else {
        setSermons(prev => [...prev, ...result.items]);
      }
      
      setCurrentPage(page);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError("Failed to load search results. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreResults = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchSearchResults(query, currentPage + 1);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div class="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div class="bg-error-900 border border-error-700 rounded-lg p-6 text-center">
          <p class="text-error-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            class="mt-4 px-4 py-2 bg-error-600 hover:bg-error-500 text-error-50 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (sermons.length === 0) {
      return (
        <div class="bg-surface-800 border border-surface-700 rounded-lg p-8 text-center">
          <p class="text-surface-300 text-lg">
            No sermons found for "{query}".
          </p>
          <p class="text-surface-400 mt-2">
            Try adjusting your search terms or browse all sermons.
          </p>
          <div class="mt-4">
            <Button to="/" variant="ghost">
              Browse All Sermons
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sermons.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} showStatus={isAdmin} />
          ))}
        </div>
        
        {currentPage < totalPages && (
          <div class="flex justify-center mt-8">
            <Button
              onClick={loadMoreResults}
              disabled={loadingMore}
              variant="ghost"
            >
              {loadingMore ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span class="ml-2">Loading...</span>
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <section class="min-h-screen p-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-primary-400">Search Results</h1>
            {query && (
              <p class="text-surface-300 mt-2">
                {totalItems > 0 ? (
                  <>
                    Found {totalItems} result{totalItems !== 1 ? 's' : ''} for "{query}"
                  </>
                ) : (
                  <>Searching for "{query}"</>
                )}
              </p>
            )}
          </div>
          {isAdmin && <Button to="/create">Create Sermon</Button>}
        </div>

        {renderContent()}
      </div>
    </section>
  );
}