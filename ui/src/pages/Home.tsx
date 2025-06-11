import { useEffect, useState } from "preact/hooks";
import { getApiClient } from "../lib/api";
import { SermonCard } from "../components/SermonCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { RecordModel } from "pocketbase";

interface Sermon {
  id: string;
  title?: string;
  date_given?: string;
  summary?: string;
  status?: string;
}

export function Home() {
  const [sermons, setSermons] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const client = getApiClient();
  const ITEMS_PER_PAGE = 9;

  const isAdmin = client.authStore.record?.role === "admin";

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await client.collection("sermons").getList(1, ITEMS_PER_PAGE, {
          sort: "-date_given,-created",
        });

        setSermons(result.items);
        setHasMore(result.totalPages > 1);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to fetch sermons:", err);
        setError("Failed to load sermons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  const loadMoreSermons = async () => {
    try {
      setLoadingMore(true);
      setError(null);

      const nextPage = currentPage + 1;
      const result = await client.collection("sermons").getList(nextPage, ITEMS_PER_PAGE, {
        sort: "-date_given,-created",
      });

      setSermons(prev => [...prev, ...result.items]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < result.totalPages);
    } catch (err) {
      console.error("Failed to load more sermons:", err);
      setError("Failed to load more sermons. Please try again.");
    } finally {
      setLoadingMore(false);
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
          <p class="text-surface-300 text-lg">No sermons found.</p>
          {isAdmin && (
            <div class="mt-4">
              <Button to="/create" variant="ghost">
                Create your first sermon
              </Button>
            </div>
          )}
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
        
        {hasMore && (
          <div class="flex justify-center mt-8">
            <Button
              onClick={loadMoreSermons}
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
          <h1 class="text-3xl font-bold text-primary-400">Sermon Analyzer</h1>
          {isAdmin && <Button to="/create">Create Sermon</Button>}
        </div>

        {renderContent()}
      </div>
    </section>
  );
}
