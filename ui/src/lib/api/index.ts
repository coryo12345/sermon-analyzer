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
  if (!response.data) return [];
  const data = response.data.data;
  if (!data) return [];
  const errs: string[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (!(value as any).message || typeof (value as any).message !== 'string') return;
    errs.push(`${capitalize(key)} ${(value as any).message.toLowerCase()}`);
  });

  return errs;
}

const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}