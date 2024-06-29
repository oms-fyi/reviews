import * as jose from "jose";
import { NextApiRequest, NextApiResponse } from "next";

import { jwtPayload } from "src/@types";

import passport from "../../../../lib/passport";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  passport.authenticate(
    req.query.provider as string,
    // eslint-disable-next-line no-unused-vars
    async (err: any, profile: jwtPayload, _info: any) => {
      if (err) {
        return res.redirect("/login");
      }

      if (!profile) {
        return res.redirect("/login");
      }

      const algo = "HS256";
      const secret = new TextEncoder().encode(
        process.env.TOKEN_SECRET as string,
      );
      const jwtToken = await new jose.SignJWT(profile)
        .setProtectedHeader({ alg: algo })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(secret);

      res.setHeader("Set-Cookie", `jwtToken=${jwtToken}; Path=/;`);
      res.redirect("/");
    },
  )(req, res);
}
