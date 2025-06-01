import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { ErrorBoundary, LocationProvider } from "preact-iso";
import { SnackbarProvider } from "./components/Snackbar";
import { SplashScreen } from "./components/SplashScreen";
import { AppContent } from "./routing";
import { getApiClient } from "./lib/api";

// required
import "./style.css";

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const client = getApiClient();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await client.collection("users").authRefresh();
      } catch (error) {
        // Auth refresh failed, which is fine - user just isn't logged in
        console.log("Auth refresh failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <LocationProvider>
      <ErrorBoundary onError={(e) => console.error(e)}>
        <SnackbarProvider>
          <AppContent />
        </SnackbarProvider>
      </ErrorBoundary>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app")!);
