import clientFactory from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error("Sanity config not found!");
}

const useCdn = true;
const apiVersion = "v2021-10-21";

const sanityClient = clientFactory({
  projectId,
  dataset,
  useCdn,
  apiVersion,
});

export { sanityClient };
