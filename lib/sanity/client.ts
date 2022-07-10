import clientFactory from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error("Sanity config not found!");
}

const useCdn = true;

const sanityClient = clientFactory({
  projectId,
  dataset,
  useCdn,
});

export { sanityClient };
