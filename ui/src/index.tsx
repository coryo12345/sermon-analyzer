import { render } from "preact";
import { ErrorBoundary, LocationProvider } from "preact-iso";
import { AppContent } from "./routing";

// required
import "./style.css";

export function App() {
  return (
    <LocationProvider>
      <ErrorBoundary onError={(e) => console.error(e)}>
        <AppContent />
      </ErrorBoundary>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app")!);
