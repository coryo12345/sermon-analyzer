import { useState } from "preact/hooks";
import { getApiClient, getErrors } from "../lib/api";
import { ClientResponseError } from "pocketbase";
import { Alert } from "../components/Alert";

export function Login() {
  const client = getApiClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);

  const signin = async (e: Event) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      await client.collection("users").authWithPassword(email, password);
      if (client.authStore.isValid) {
        window.location.href = "/";
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      const errs = getErrors(err as ClientResponseError);
      setError(errs?.[0] || "Please check your information and try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-background-50 dark:bg-background-950 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-background-900 dark:text-background-50">
            Welcome Back!
          </h2>
          <p class="mt-2 text-sm text-background-600 dark:text-background-400">
            Sign in to your account to continue to Sermon Analyzer
          </p>
        </div>

        <div class="bg-white dark:bg-surface-900 py-8 px-6 shadow-xl rounded-xl border border-surface-200 dark:border-surface-700">
          <form class="space-y-6" onSubmit={signin}>
            {error && (
              <Alert type="error" title="Login Failed" message={error} />
            )}
            <div>
              <label
                htmlFor="email"
                class="block text-sm font-medium text-background-700 dark:text-background-300"
              >
                Email address
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onInput={(e) =>
                    setEmail((e.target as HTMLInputElement).value)
                  }
                  class="appearance-none block w-full px-3 py-3 border border-surface-300 dark:border-surface-600 rounded-lg placeholder-surface-400 dark:placeholder-surface-500 bg-white dark:bg-surface-800 text-background-900 dark:text-background-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                class="block text-sm font-medium text-background-700 dark:text-background-300"
              >
                Password
              </label>
              <div class="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onInput={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                  class="appearance-none block w-full px-3 py-3 border border-surface-300 dark:border-surface-600 rounded-lg placeholder-surface-400 dark:placeholder-surface-500 bg-white dark:bg-surface-800 text-background-900 dark:text-background-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* <div class="flex items-center justify-between">
              div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe((e.target as HTMLInputElement).checked)
                  }
                  class="h-4 w-4 cursor-pointer text-primary-600 focus:ring-primary-500 border-surface-300 dark:border-surface-600 rounded bg-white dark:bg-surface-800"
                />
                <label
                  htmlFor="remember-me"
                  class="ml-2 block text-sm cursor-pointer text-background-700 dark:text-background-300"
                >
                  Remember me
                </label>
              </div>

              <div class="text-sm">
                <a
                  href="#"
                  class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Forgot your password?
                </a>
              </div>
            </div> */}

            <div>
              <button
                type="submit"
                disabled={loading}
                class="group cursor-pointer relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-surface-900 transition-colors duration-200"
              >
                Sign in
              </button>
            </div>

            <div class="text-center">
              <p class="text-sm text-background-600 dark:text-background-400">
                Don't have an account?{" "}
                <a
                  href="/register"
                  class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
