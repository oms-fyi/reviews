import { NextApiRequest, NextApiResponse } from "next";

import { UserToken } from "src/@types";
import { createToken } from "src/lib/jwt";

import passport from "../../../../lib/passport";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  passport.authenticate(
    req.query.provider as string,
    // eslint-disable-next-line no-unused-vars
    async (err: any, profile: UserToken, _info: any) => {
      if (err) {
        return res.redirect("/login");
      }

      if (!profile) {
        return res.redirect("/login");
      }

      const jwtToken = await createToken(profile);
      const expirationDate = new Date(Date.now() + 400 * 24 * 60 * 60 * 1000); // expire in 400 days ()
      res.setHeader("Set-Cookie", `jwtToken=${jwtToken}; Path=/; Expires=${expirationDate.toUTCString()};`);
      res.redirect("/");
    },
  )(req, res);
}
