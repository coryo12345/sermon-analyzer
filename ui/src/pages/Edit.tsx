import { RecordModel } from "pocketbase";
import { useEffect, useState } from "preact/hooks";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getApiClient, getErrors } from "../lib/api";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { BackToTop } from "../components/BackToTop";
import { ClientResponseError } from "pocketbase";

export function Edit() {
  const [sermon, setSermon] = useState<RecordModel | null>(null);
  const [details, setDetails] = useState<RecordModel[]>([]);
  const [questions, setQuestions] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [summary, setSummary] = useState("");

  const client = getApiClient();
  const isAdmin = client.authStore.record?.role === "admin";

  // Extract sermon ID from query parameters
  const params = new URLSearchParams(window.location.search);
  const sermonId = params.get("id");

  useEffect(() => {
    // Check if user has admin role
    if (!isAdmin) {
      window.location.href = "/";
      return;
    }
  }, [isAdmin]);

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

        // Set form state
        setTitle(sermonResult.title || "");
        setSpeaker(sermonResult.speaker || "");
        setSummary(sermonResult.summary || "");

        // Format date for input
        if (sermonResult.date_given) {
          const date = new Date(sermonResult.date_given);
          setDateGiven(date.toISOString().split("T")[0]);
        }

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
          "Failed to load sermon. It may not exist or you may not have permission to edit it."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSermonData();
  }, [sermonId]);

  const handleCancel = () => {
    window.location.href = `/view?id=${sermonId}`;
  };

  const handleSave = async () => {
    if (!sermon) return;

    setSaving(true);
    setError(null);

    try {
      // Convert date back to UTC with 10am EST time
      let utcDate = sermon.date_given;
      if (dateGiven) {
        const localDate = new Date(dateGiven + "T10:00:00");
        localDate.setHours(localDate.getHours() + 5);
        utcDate = localDate.toISOString();
      }

      // Update sermon
      await client.collection("sermons").update(sermon.id, {
        title,
        speaker,
        summary,
        date_given: utcDate,
      });

      // Update details
      for (const detail of details) {
        await client.collection("sermon_details").update(detail.id, {
          title: detail.title,
          description: detail.description,
          key_verse: detail.key_verse,
          relevant_verses: detail.relevant_verses,
        });
      }

      // Update questions
      for (const question of questions) {
        await client.collection("sermon_questions").update(question.id, {
          title: question.title,
          description: question.description,
        });
      }

      // Redirect to view page on success
      window.location.href = `/view?id=${sermonId}`;
    } catch (err) {
      const errs = getErrors(err as ClientResponseError);
      setError(errs?.[0] || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateDetail = (index: number, field: string, value: string) => {
    const updatedDetails = [...details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setDetails(updatedDetails);
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div class="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!sermon) {
      return (
        <div class="text-center py-12">
          <div class="text-6xl mb-4">😕</div>
          <h2 class="text-xl font-semibold text-surface-100 mb-2">
            Sermon not found
          </h2>
          <p class="text-surface-400 mb-6">
            This sermon may not exist or you don't have permission to edit it.
          </p>
          <div class="flex justify-center">
            <Button onClick={() => (window.location.href = "/")}>
              Go Home
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div class="space-y-6">
        {/* Action buttons */}
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-surface-50">Edit Sermon</h1>
          <div class="flex gap-4">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>

        {error && <Alert type="error" title="Save Failed" message={error} />}

        {/* Sermon basic info */}
        <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
          <h2 class="text-2xl font-bold text-surface-50 mb-6">
            Basic Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
                class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-700 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={saving}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-300 mb-2">
                Speaker
              </label>
              <input
                type="text"
                value={speaker}
                onInput={(e) =>
                  setSpeaker((e.target as HTMLInputElement).value)
                }
                class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-700 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={saving}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-300 mb-2">
                Date Given
              </label>
              <input
                type="date"
                value={dateGiven}
                onInput={(e) =>
                  setDateGiven((e.target as HTMLInputElement).value)
                }
                class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-700 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={saving}
              />
            </div>
          </div>

          <div class="mt-6">
            <label class="block text-sm font-medium text-surface-300 mb-2">
              Summary
            </label>
            <textarea
              value={summary}
              onInput={(e) =>
                setSummary((e.target as HTMLTextAreaElement).value)
              }
              rows={4}
              class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-700 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={saving}
            />
          </div>
        </div>

        {/* Sermon details */}
        {details.length > 0 && (
          <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
            <h2 class="text-2xl font-bold text-surface-50 mb-6">Notes</h2>
            <div class="space-y-6">
              {details.map((detail, index) => (
                <div
                  key={detail.id}
                  class="bg-surface-700 rounded-lg p-4 border-l-4 border-primary-500"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-sm font-medium text-surface-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={detail.title || ""}
                        onInput={(e) =>
                          updateDetail(
                            index,
                            "title",
                            (e.target as HTMLInputElement).value
                          )
                        }
                        class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-600 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-surface-300 mb-2">
                        Key Verse
                      </label>
                      <input
                        type="text"
                        value={detail.key_verse || ""}
                        onInput={(e) =>
                          updateDetail(
                            index,
                            "key_verse",
                            (e.target as HTMLInputElement).value
                          )
                        }
                        class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-600 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={detail.description || ""}
                      onInput={(e) =>
                        updateDetail(
                          index,
                          "description",
                          (e.target as HTMLTextAreaElement).value
                        )
                      }
                      rows={4}
                      class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-600 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-surface-300 mb-2">
                      Relevant Verses (separated by |)
                    </label>
                    <input
                      type="text"
                      value={detail.relevant_verses || ""}
                      onInput={(e) =>
                        updateDetail(
                          index,
                          "relevant_verses",
                          (e.target as HTMLInputElement).value
                        )
                      }
                      class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-600 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={saving}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sermon questions */}
        {questions.length > 0 && (
          <div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
            <h2 class="text-2xl font-bold text-surface-50 mb-6">
              Discussion Questions
            </h2>
            <div class="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} class="bg-surface-700 rounded-lg p-4">
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-surface-300 mb-2">
                      Question {index + 1}
                    </label>
                    <input
                      type="text"
                      value={question.title || ""}
                      onInput={(e) =>
                        updateQuestion(
                          index,
                          "title",
                          (e.target as HTMLInputElement).value
                        )
                      }
                      class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-600 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={question.description || ""}
                      onInput={(e) =>
                        updateQuestion(
                          index,
                          "description",
                          (e.target as HTMLTextAreaElement).value
                        )
                      }
                      rows={3}
                      class="w-full px-3 py-2 border border-surface-600 rounded-lg bg-surface-600 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={saving}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section class="min-h-screen p-2 md:p-6">
      <div class="max-w-4xl mx-auto">{renderContent()}</div>
      <BackToTop />
    </section>
  );
}
