export interface Publication {
  title: string;
  file: string;
  originalFilename: string;
  bytes: number;
}

export async function fetchPublications(signal?: AbortSignal): Promise<Publication[]> {
  const response = await fetch("/data/publications.json", { signal });
  if (!response.ok) throw new Error("The publications list could not be loaded.");
  const publications = (await response.json()) as Publication[];
  return [...publications, ...safeguardingDocuments.map(({ title, file, originalFilename, bytes }) => ({
    title,
    file,
    originalFilename,
    bytes,
  }))];
}

export const formatBytes = (bytes: number) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
import { safeguardingDocuments } from "@/data/safeguardingDocuments";

