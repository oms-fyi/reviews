import clientFactory from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error("Sanity config not found!");
}

const useCdn = false;
const apiVersion = "v2021-10-21";

const sanityClient = clientFactory({
  projectId,
  dataset,
  useCdn,
  apiVersion,
});

export { sanityClient };
