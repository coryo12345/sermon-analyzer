import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { getApiClient } from "../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { RecordModel } from "pocketbase";

export function SermonView() {
  const [sermon, setSermon] = useState<RecordModel | null>(null);
  const [details, setDetails] = useState<RecordModel[]>([]);
  const [questions, setQuestions] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const client = getApiClient();
  const isAdmin = client.authStore.record?.role === "admin";
  
  // Extract sermon ID from query parameters
  const params = new URLSearchParams(window.location.search);
  const sermonId = params.get('id');

  useEffect(() => {
    if (!sermonId) {
      setError("No sermon ID provided");
      setLoading(false);
      return;
    }

    const fetchSermonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch sermon
        const sermonResult = await client.collection('sermons').getOne(sermonId);
        setSermon(sermonResult);

        // Fetch sermon details
        const detailsResult = await client.collection('sermon_details').getList(1, 50, {
          filter: `sermon_id="${sermonId}"`,
          sort: 'order',
        });
        setDetails(detailsResult.items);

        // Fetch sermon questions
        const questionsResult = await client.collection('sermon_questions').getList(1, 50, {
          filter: `sermon_id="${sermonId}"`,
          sort: 'order',
        });
        setQuestions(questionsResult.items);

      } catch (err) {
        console.error('Failed to fetch sermon:', err);
        setError('Failed to load sermon. It may not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchSermonData();
  }, [sermonId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "complete":
        return "bg-success-500 text-success-50";
      case "pending":
        return "bg-warning-500 text-warning-50";
      case "error":
        return "bg-error-500 text-error-50";
      case "created":
      default:
        return "bg-surface-500 text-surface-50";
    }
  };

  const formatVerses = (verses: string) => {
    if (!verses) return [];
    return verses.split('|').filter(v => v.trim());
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div class="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error || !sermon) {
      return (
        <div class="bg-error-900 border border-error-700 rounded-lg p-6 text-center">
          <p class="text-error-300">{error}</p>
          <div class="mt-4 space-x-4">
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try Again
            </Button>
            <Button to="/" variant="ghost">
              Back to Home
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div class="space-y-8">
        {/* Sermon Header */}
        <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-3xl font-bold text-surface-50">
              {sermon.title || "Untitled Sermon"}
            </h1>
            {isAdmin && sermon.status && (
              <span class={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sermon.status)}`}>
                {sermon.status}
              </span>
            )}
          </div>
          
          <div class="text-surface-300 mb-4">
            <p>Date: {formatDate(sermon.date_given)}</p>
          </div>

          {sermon.summary && (
            <div>
              <h3 class="text-lg font-semibold text-surface-100 mb-2">Summary</h3>
              <p class="text-surface-200 leading-relaxed">{sermon.summary}</p>
            </div>
          )}
        </div>

        {/* Sermon Details */}
        {details.length > 0 && (
          <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
            <h2 class="text-2xl font-bold text-surface-50 mb-6">Details</h2>
            <div class="space-y-6">
              {details.map((detail) => (
                <div key={detail.id} class="border-l-4 border-primary-500 pl-4">
                  <h3 class="text-lg font-semibold text-surface-100 mb-2">
                    {detail.title}
                  </h3>
                  <p class="text-surface-200 mb-3 leading-relaxed">
                    {detail.description}
                  </p>
                  
                  {detail.key_verse && (
                    <div class="mb-2">
                      <span class="text-primary-400 font-medium">Key Verse: </span>
                      <span class="text-surface-300">{detail.key_verse}</span>
                    </div>
                  )}

                  {detail.relevant_verses && formatVerses(detail.relevant_verses).length > 0 && (
                    <div>
                      <span class="text-primary-400 font-medium">Relevant Verses: </span>
                      <span class="text-surface-300">
                        {formatVerses(detail.relevant_verses).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && (
          <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
            <h2 class="text-2xl font-bold text-surface-50 mb-6">Discussion Questions</h2>
            <div class="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} class="bg-surface-700 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-surface-100 mb-2">
                    {index + 1}. {question.title}
                  </h3>
                  <p class="text-surface-200 leading-relaxed">
                    {question.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty states */}
        {details.length === 0 && questions.length === 0 && sermon.status === "complete" && (
          <div class="bg-surface-800 border border-surface-700 rounded-lg p-8 text-center">
            <p class="text-surface-300">No additional details or questions available for this sermon.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <section class="min-h-screen bg-background-900 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="mb-6">
          <Button to="/" variant="ghost" size="sm">
            ← Back to Sermons
          </Button>
        </div>
        
        {renderContent()}
      </div>
    </section>
  );
}