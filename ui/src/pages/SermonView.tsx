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
  const sermonId = params.get("id");

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
        const sermonResult = await client
          .collection("sermons")
          .getOne(sermonId);
        setSermon(sermonResult);

        // Fetch sermon details
        const detailsResult = await client
          .collection("sermon_details")
          .getList(1, 50, {
            filter: `sermon_id="${sermonId}"`,
            sort: "order",
          });
        setDetails(detailsResult.items);

        // Fetch sermon questions
        const questionsResult = await client
          .collection("sermon_questions")
          .getList(1, 50, {
            filter: `sermon_id="${sermonId}"`,
            sort: "order",
          });
        setQuestions(questionsResult.items);
      } catch (err) {
        console.error("Failed to fetch sermon:", err);
        setError(
          "Failed to load sermon. It may not exist or you may not have permission to view it."
        );
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
        <div class="text-center py-12">
          <div class="text-6xl mb-4">😕</div>
          <h2 class="text-xl font-semibold text-surface-100 mb-2">
            Sermon not found
          </h2>
          <p class="text-surface-400 mb-6">
            This sermon may not exist or you don't have permission to view it.
          </p>
        </div>
      );
    }

    return (
      <div class="space-y-8">
        <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-3xl font-bold text-surface-50">
              {sermon.title || "Untitled Sermon"}
            </h1>
            <div class="text-surface-300">
              <p>Date: {formatDate(sermon.date_given)}</p>
            </div>
          </div>

          <div class="flex justify-between items-start mb-4">
            <div class="text-surface-300">{sermon.speaker}</div>
            {isAdmin && sermon.status && (
              <span
                class={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sermon.status)}`}
              >
                {sermon.status}
              </span>
            )}
          </div>

          {sermon.summary && (
            <div>
              <h3 class="text-lg font-semibold text-surface-100 mb-2">
                Summary
              </h3>
              <p class="text-surface-200 leading-relaxed">{sermon.summary}</p>
            </div>
          )}
        </div>

        {details.length > 0 && <SermonNotes details={details} />}

        {questions.length > 0 && <SermonQuestions questions={questions} />}

        {details.length === 0 &&
          questions.length === 0 &&
          sermon.status === "complete" && (
            <div class="bg-surface-800 border border-surface-700 rounded-lg p-8 text-center">
              <p class="text-surface-300">
                No additional details or questions available for this sermon.
              </p>
            </div>
          )}
      </div>
    );
  };

  return (
    <section class="min-h-screen p-6">
      <div class="max-w-4xl mx-auto">{renderContent()}</div>
    </section>
  );
}

function SermonNotes({ details }: { details: RecordModel[] }) {
  const formatVerses = (verses: string) => {
    if (!verses) return [];
    return verses.split("|").filter((v) => v.trim());
  };

  const verseLink = (verse: string) => {
    return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(verse)}&version=NIV`;
  };

  return (
    <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
      <h2 class="text-2xl font-bold text-surface-50 mb-6">Details</h2>
      <div class="space-y-6">
        {details.map((detail) => (
          <div
            key={detail.id}
            class="bg-surface-700 rounded-lg py-2 border-l-8 border-primary-500 pl-4"
          >
            <h3 class="text-lg font-semibold text-surface-100 mb-2">
              {detail.title}
            </h3>

            {detail.key_verse && (
              <div class="mb-2">
                <span class="font-semibold">Key Verse: </span>
                <a
                  href={verseLink(detail.key_verse)}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-400 cursor-pointer hover:underline"
                >
                  {detail.key_verse}
                </a>
              </div>
            )}

            <p class="text-surface-200 mb-3 whitespace-pre-line leading-relaxed">
              {detail.description}
            </p>

            {detail.relevant_verses &&
              formatVerses(detail.relevant_verses).length > 0 && (
                <div>
                  <span class="font-semibold">Relevant Verses: </span>
                  <span class="flex flex-wrap gap-1">
                    {formatVerses(detail.relevant_verses).map((verse) => (
                      <a
                        href={verseLink(detail.relevant_verses)}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary-400 cursor-pointer hover:underline"
                      >
                        {verse}
                      </a>
                    ))}
                  </span>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SermonQuestions({ questions }: { questions: RecordModel[] }) {
  return (
    <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
      <h2 class="text-2xl font-bold text-surface-50 mb-6">
        Discussion Questions
      </h2>
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
  );
}
