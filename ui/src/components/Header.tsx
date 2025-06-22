import { getApiClient } from "../lib/api";
import { Button } from "./Button";
import { SermonSearch } from "./SermonSearch";

export function Header() {
  const client = getApiClient();

  const logout = () => {
    client.authStore.clear();
    window.location.href = "/login";
  };

  return (
    <header className="bg-background-900 border-b border-surface-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <a
            href="/"
            className="text-primary-400 hover:text-primary-300 font-semibold text-lg transition-colors flex-shrink-0"
          >
            Home
          </a>
          <div className="flex-1 max-w-md">
            <SermonSearch />
          </div>
          <Button variant="ghost" onClick={logout} className="flex-shrink-0">
            Sign Out
          </Button>
        </div>
      </nav>
    </header>
  );
}
