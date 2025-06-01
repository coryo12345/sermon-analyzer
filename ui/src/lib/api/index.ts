import PocketBase, { ClientResponseError } from "pocketbase";

let client: PocketBase | null = null;
export const getApiClient = () => {
  if (!client) {
    if (!import.meta.env.VITE_API_URL) {
      throw new Error("API URL is not provided");
    }
    client = new PocketBase(import.meta.env.VITE_API_URL);
  }
  return client;
};

export const getErrors = (response: ClientResponseError): string[] => {
  const data = response.data;
  if (!data) return [];
  const errs: string[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (!value.message || typeof value.message !== 'string') return;
    errs.push(`${capitalize(key)} ${value.message.toLowerCase()}`);
  });

  return errs;
}

const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}