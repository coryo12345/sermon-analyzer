import { RecordModel } from "pocketbase";

interface SermonCardProps {
  sermon: RecordModel;
  showStatus?: boolean;
}

export function SermonCard({ sermon, showStatus = false }: SermonCardProps) {
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

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <a
      href={`/view?id=${sermon.id}`}
      class="block bg-surface-800 border border-surface-700 rounded-lg p-6 hover:bg-surface-700 transition-colors cursor-pointer"
    >
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-lg font-semibold text-surface-50 leading-tight">
          {sermon.title || "Untitled Sermon"}
        </h3>
        <div class="text-surface-300 text-sm">
          {formatDate(sermon.date_given)}
        </div>
      </div>

      <div class="flex justify-between items-start mb-3">
        <div class="text-surface-300 text-sm">{sermon.speaker}</div>
        {showStatus && sermon.status && (
          <span
            class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sermon.status)}`}
          >
            {sermon.status}
          </span>
        )}
      </div>

      {sermon.summary && (
        <p class="text-surface-200 text-sm leading-relaxed">
          {truncateText(sermon.summary)}
        </p>
      )}
    </a>
  );
}
