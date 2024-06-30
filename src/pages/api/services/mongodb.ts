import { NextApiRequest, NextApiResponse } from "next";

import { connectToDatabase } from "src/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { db } = await connectToDatabase();

  const data = await db.collection("dummy").find({}).toArray();

  res.json(data);
}
