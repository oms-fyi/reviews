import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

// NOT AVAILABLE IN BROWSER, ONLY NEEDED FOR WRITES
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Sanity config not found!");
}

const apiVersion = "2025-02-06";

/** Public reads — no token; CDN-safe. */
export const sanityClient = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion,
});

/** Creates/patches — requires SANITY_API_WRITE_TOKEN; do not use CDN with a token. */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  token,
  useCdn: false,
  apiVersion,
});
