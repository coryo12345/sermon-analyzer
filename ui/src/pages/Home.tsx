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
  const [error, setError] = useState<string | null>(null);
  const client = getApiClient();

  const isAdmin = client.authStore.record?.role === "admin";

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await client.collection("sermons").getList(1, 50, {
          sort: "-date_given,-created",
        });

        setSermons(result.items);
      } catch (err) {
        console.error("Failed to fetch sermons:", err);
        setError("Failed to load sermons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sermons.map((sermon) => (
          <SermonCard key={sermon.id} sermon={sermon} showStatus={isAdmin} />
        ))}
      </div>
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
