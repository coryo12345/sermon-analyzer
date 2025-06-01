import { render } from "preact";
import { ErrorBoundary, LocationProvider } from "preact-iso";
import { AppContent } from "./routing";
import { SnackbarProvider } from "./components/Snackbar";

// required
import "./style.css";

export function App() {
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
