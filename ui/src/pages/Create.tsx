import { useEffect, useState } from "preact/hooks";
import { getApiClient, getErrors } from "../lib/api";
import { ClientResponseError } from "pocketbase";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";

export function Create() {
  const client = getApiClient();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has admin role
    const user = client.authStore.record;
    if (!user || user.role !== "admin") {
      window.location.href = "/";
      return;
    }
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // TODO: Implement sermon creation logic
      console.log("Creating sermon with:", {
        title,
        date_given: date,
        speaker,
        audio_url: audioUrl,
      });

      // Placeholder for now - this will be implemented later
      alert("Sermon creation functionality to be implemented");
    } catch (err) {
      const errs = getErrors(err as ClientResponseError);
      setError(errs?.[0] || "Failed to create sermon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-background-900 dark:text-background-50">
          Create New Sermon
        </h1>
        <p class="mt-2 text-background-600 dark:text-background-400">
          Add a new sermon to the analysis system
        </p>
      </div>

      <div class="bg-white dark:bg-surface-900 py-8 px-6 shadow-xl rounded-xl border border-surface-200 dark:border-surface-700">
        <form class="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <Alert type="error" title="Creation Failed" message={error} />
          )}

          <div>
            <label
              htmlFor="title"
              class="block text-sm font-medium text-background-700 dark:text-background-300"
            >
              Title
            </label>
            <div class="mt-1">
              <input
                id="title"
                name="title"
                type="text"
                required
                disabled={loading}
                value={title}
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
                class="appearance-none block w-full px-3 py-3 border border-surface-300 dark:border-surface-600 rounded-lg placeholder-surface-400 dark:placeholder-surface-500 bg-white dark:bg-surface-800 text-background-900 dark:text-background-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="Enter sermon title"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="date"
              class="block text-sm font-medium text-background-700 dark:text-background-300"
            >
              Date Given
            </label>
            <div class="mt-1">
              <input
                id="date"
                name="date"
                type="date"
                disabled={loading}
                value={date}
                onInput={(e) => setDate((e.target as HTMLInputElement).value)}
                class="appearance-none block w-full px-3 py-3 border border-surface-300 dark:border-surface-600 rounded-lg placeholder-surface-400 dark:placeholder-surface-500 bg-white dark:bg-surface-800 text-background-900 dark:text-background-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="speaker"
              class="block text-sm font-medium text-background-700 dark:text-background-300"
            >
              Speaker
            </label>
            <div class="mt-1">
              <input
                id="speaker"
                name="speaker"
                type="text"
                disabled={loading}
                value={speaker}
                onInput={(e) =>
                  setSpeaker((e.target as HTMLInputElement).value)
                }
                class="appearance-none block w-full px-3 py-3 border border-surface-300 dark:border-surface-600 rounded-lg placeholder-surface-400 dark:placeholder-surface-500 bg-white dark:bg-surface-800 text-background-900 dark:text-background-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="Enter speaker name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="audioUrl"
              class="block text-sm font-medium text-background-700 dark:text-background-300"
            >
              Audio URL
            </label>
            <div class="mt-1">
              <input
                id="audioUrl"
                name="audioUrl"
                type="url"
                required
                disabled={loading}
                value={audioUrl}
                onInput={(e) =>
                  setAudioUrl((e.target as HTMLInputElement).value)
                }
                class="appearance-none block w-full px-3 py-3 border border-surface-300 dark:border-surface-600 rounded-lg placeholder-surface-400 dark:placeholder-surface-500 bg-white dark:bg-surface-800 text-background-900 dark:text-background-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="https://example.com/audio.mp3"
              />
            </div>
          </div>

          <div class="flex gap-4">
            <Button type="submit" loading={loading} className="flex-1">
              Create Sermon
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
