import { useState, useEffect } from "preact/hooks";
import { getApiClient, getErrors } from "../lib/api";
import { ClientResponseError } from "pocketbase";
import { useSnackbar } from "../components/Snackbar";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { AreYouSure } from "../components/AreYouSure";

export function ManageAccount() {
  const client = getApiClient();
  const { addMessage } = useSnackbar();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if user is not logged in
    if (!client.authStore.isValid) {
      window.location.href = "/login";
      return;
    }

    // Set current user data
    setUser(client.authStore.record);
  }, []);

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    try {
      setDeleteLoading(true);
      setError(null);
      
      // Delete the user account
      await client.collection("users").delete(user.id);
      
      // Clear auth store and redirect to login
      client.authStore.clear();
      
      addMessage({
        type: "success",
        title: "Account deleted",
        message: "Your account has been successfully deleted.",
        duration: 3000,
      });
      
      window.location.href = "/login";
    } catch (err) {
      const errs = getErrors(err as ClientResponseError);
      setError(errs?.[0] || "Failed to delete account. Please try again.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-background-50 dark:bg-background-950">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-4 text-background-600 dark:text-background-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-background-50 dark:bg-background-950 px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-background-900 dark:text-background-50">
            Manage Account
          </h1>
          <p class="mt-2 text-background-600 dark:text-background-400">
            View and manage your account information
          </p>
        </div>

        <div class="bg-white dark:bg-surface-900 shadow-xl rounded-xl border border-surface-200 dark:border-surface-700">
          <div class="px-6 py-8">
            {error && (
              <Alert type="error" title="Error" message={error} />
            )}

            <div class="space-y-6">
              {/* Account Information */}
              <div>
                <h3 class="text-lg font-medium text-background-900 dark:text-background-50 mb-4">
                  Account Information
                </h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-background-700 dark:text-background-300 mb-2">
                      Email Address
                    </label>
                    <div class="px-3 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-lg">
                      <span class="text-background-900 dark:text-background-100">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-background-700 dark:text-background-300 mb-2">
                      Account Created
                    </label>
                    <div class="px-3 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-lg">
                      <span class="text-background-900 dark:text-background-100">
                        {new Date(user.created).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {user.updated && user.updated !== user.created && (
                    <div>
                      <label class="block text-sm font-medium text-background-700 dark:text-background-300 mb-2">
                        Last Updated
                      </label>
                      <div class="px-3 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-lg">
                        <span class="text-background-900 dark:text-background-100">
                          {new Date(user.updated).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div class="border-t border-surface-200 dark:border-surface-700 pt-6">
                <h3 class="text-lg font-medium text-error-600 dark:text-error-400 mb-4">
                  Danger Zone
                </h3>
                <div class="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-error-800 dark:text-error-200">
                        Delete Account
                      </h4>
                      <p class="mt-1 text-sm text-error-700 dark:text-error-300">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="ml-4"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <AreYouSure
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data."
          confirmText="Delete Account"
          confirmVariant="danger"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
