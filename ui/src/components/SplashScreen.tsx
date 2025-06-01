export function SplashScreen() {
  return (
    <div class="min-h-screen flex items-center justify-center bg-background-50 dark:bg-background-950">
      <div class="text-center">
        <div class="mb-8">
          <div class="w-16 h-16 mx-auto">
            <svg
              class="animate-spin w-16 h-16 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>

        <h1 class="text-2xl font-bold text-background-900 dark:text-background-50 mb-2">
          Sermon Analyzer
        </h1>

        <p class="text-background-600 dark:text-background-400">Loading...</p>
      </div>
    </div>
  );
}
