import { useState, useEffect } from "preact/hooks";
import { getApiClient, getErrors } from "../lib/api";
import { useLocation } from "preact-iso";
import { ClientResponseError } from "pocketbase";
import { useSnackbar } from "../components/Snackbar";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";

export function Register() {
  const client = getApiClient();
  const { addMessage } = useSnackbar();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect to home if user is already logged in
    if (client.authStore.isValid) {
      window.location.href = "/";
      return;
    }
  }, []);

  const signup = async (e: Event) => {
    e.preventDefault();

    try {
      setError(null);
      setLoading(true);
      const authData = await client.collection("users").create({
        email,
        emailVisibility: true,
        password,
        passwordConfirm,
      });

      if (authData.id) {
        await client.collection("users").authWithPassword(email, password);

        if (!client.authStore.isValid) {
          // i dont think this should happen, but in theory it could? just in case
          throw new Error("Something went wrong. Please try again.");
        }

        addMessage({
          type: "success",
          title: "Account created successfully!",
          message: "Welcome to Sermon Analyzer",
          duration: 1001,
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
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
            Create Account
          </h2>
          <p class="mt-2 text-sm text-background-600 dark:text-background-400">
            Sign up to get started with Sermon Analyzer
          </p>
        </div>

        <div class="bg-white dark:bg-surface-900 py-8 px-6 shadow-xl rounded-xl border border-surface-200 dark:border-surface-700">
          <form class="space-y-6" onSubmit={signup}>
            {error && (
              <Alert type="error" title="Registration Failed" message={error} />
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
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  value={password}
                  onInput={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                  class="appearance-none block w-full px-3 py-3 border border-surface-300 dark:border-surface-600 rounded-lg placeholder-surface-400 dark:placeholder-surface-500 bg-white dark:bg-surface-800 text-background-900 dark:text-background-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                class="block text-sm font-medium text-background-700 dark:text-background-300"
              >
                Confirm Password
              </label>
              <div class="mt-1">
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  value={passwordConfirm}
                  onInput={(e) =>
                    setPasswordConfirm((e.target as HTMLInputElement).value)
                  }
                  class="appearance-none block w-full px-3 py-3 border border-surface-300 dark:border-surface-600 rounded-lg placeholder-surface-400 dark:placeholder-surface-500 bg-white dark:bg-surface-800 text-background-900 dark:text-background-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" loading={loading}>
                Create Account
              </Button>
            </div>

            <div class="text-center">
              <p class="text-sm text-background-600 dark:text-background-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
