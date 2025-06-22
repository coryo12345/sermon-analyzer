import { useState, useEffect, useRef } from "preact/hooks";
import { getApiClient } from "../lib/api";
import { RecordModel } from "pocketbase";

interface SermonSearchProps {
  onNavigate?: (path: string) => void;
}

export function SermonSearch({ onNavigate }: SermonSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecordModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const client = getApiClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim() === "") {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await client.collection("sermons").getList(1, 3, {
          filter: `title ~ "${query}" || summary ~ "${query}"`,
          sort: "-date_given,-created",
        });
        setResults(result.items);
        setIsOpen(true);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setQuery(target.value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchQuery = encodeURIComponent(query.trim());
      if (onNavigate) {
        onNavigate(`/search?q=${searchQuery}`);
      } else {
        window.location.href = `/search?q=${searchQuery}`;
      }
      setIsOpen(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleResultClick = (sermonId: string) => {
    if (onNavigate) {
      onNavigate(`/view?id=${sermonId}`);
    } else {
      window.location.href = `/view?id=${sermonId}`;
    }
    setIsOpen(false);
    setQuery("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onInput={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          placeholder="Search sermons..."
          className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-800 border border-surface-700 rounded-lg shadow-lg z-50 max-h-[75vh] overflow-y-auto">
          {results.map((sermon) => (
            <button
              key={sermon.id}
              onClick={() => handleResultClick(sermon.id)}
              className="w-full text-left px-4 py-3 hover:bg-surface-700 transition-colors border-b border-surface-700 last:border-b-0"
            >
              <div className="text-surface-100 font-medium truncate">
                {sermon.title || "Untitled Sermon"}
              </div>
              {sermon.date_given && (
                <div className="text-surface-400 text-sm mt-1">
                  {formatDate(sermon.date_given)}
                </div>
              )}
              {sermon.summary && (
                <div className="text-surface-300 text-sm mt-1 line-clamp-2">
                  {sermon.summary}
                </div>
              )}
            </button>
          ))}
          {query.trim() && (
            <button
              onClick={() => {
                const searchQuery = encodeURIComponent(query.trim());
                if (onNavigate) {
                  onNavigate(`/search?q=${searchQuery}`);
                } else {
                  window.location.href = `/search?q=${searchQuery}`;
                }
                setIsOpen(false);
                setQuery("");
              }}
              className="w-full text-left px-4 py-3 hover:bg-surface-700 transition-colors text-primary-400 font-medium"
            >
              View all results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}