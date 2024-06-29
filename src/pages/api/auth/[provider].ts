import { NextApiRequest, NextApiResponse } from "next";

import passport from "../../../lib/passport";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  passport.authenticate(req.query.provider as string)(req, res);
}
