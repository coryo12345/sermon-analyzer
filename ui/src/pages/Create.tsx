import { useEffect } from "preact/hooks";
import { getApiClient } from "../lib/api";

export function Create() {
  const client = getApiClient();

  useEffect(() => {
    // Check if user has admin role
    const user = client.authStore.record;
    if (!user || user.role !== "admin") {
      window.location.href = "/";
      return;
    }
  }, []);

  return (
    <section>
      <h1 class="text-3xl font-bold text-primary-400">Create Sermon</h1>
      <p class="mt-4">Admin panel for creating new sermons.</p>
    </section>
  );
}