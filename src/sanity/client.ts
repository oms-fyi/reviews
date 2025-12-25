import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

// NOT AVAILABLE IN BROWSER, ONLY NEEDED FOR WRITES
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Sanity config not found!");
}

const useCdn = true;
const apiVersion = "2025-02-06";

export const sanityClient = createClient({
  projectId,
  dataset,
  token,
  useCdn,
  apiVersion,
});
