import { lazy, Route, Router, useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { Header } from "./components/Header.jsx";
import { getApiClient } from "./lib/api";

const LoginPage = lazy(() => import("./pages/Login.jsx").then((m) => m.Login));
const RegisterPage = lazy(() =>
  import("./pages/Register.jsx").then((m) => m.Register)
);
const HomePage = lazy(() => import("./pages/Home.jsx").then((m) => m.Home));
const NotFoundPage = lazy(() =>
  import("./pages/_404.jsx").then((m) => m.NotFound)
);

export function AppContent() {
  const location = useLocation();
  const client = getApiClient();
  
  const isAuthPage = location.path === "/login" || location.path === "/register";
  const isLoggedIn = client.authStore.isValid;

  useEffect(() => {
    // If user is not logged in and trying to access a protected route, redirect to login
    if (!isLoggedIn && !isAuthPage) {
      window.location.href = "/login";
    }
  }, [isLoggedIn, isAuthPage, location.path]);

  return (
    <>
      {!isAuthPage && <Header />}
      <main>
        <Router>
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route default component={NotFoundPage} />
        </Router>
      </main>
    </>
  );
}
