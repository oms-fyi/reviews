import { Strategy as OAuth2Strategy } from "passport-oauth2";

import { jwtPayload } from "src/@types";

const strategy = new OAuth2Strategy(
  {
    tokenURL: process.env.FIB_TOKEN_URL || "",
    authorizationURL: process.env.FIB_AUTH_URL || "",
    clientID: process.env.FIB_CLIENT_ID || "",
    clientSecret: process.env.FIB_CLIENT_SECRET || "",
    callbackURL: process.env.FIB_REDIRECT_URI || "",
  },
  (accessToken: string, refreshToken: string, _profile: any, done: any) => {
    const user: jwtPayload = {
      accessToken,
      refreshToken,
      email: "",
    };

    return done(null, user);
  },
);

export default strategy;
