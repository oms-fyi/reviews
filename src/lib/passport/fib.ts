import { Strategy as OAuth2Strategy } from "passport-oauth2";

import { jwtPayload } from "src/@types";

interface userFibApi {
  assignatures: string;
  avisos: string;
  classes: string;
  foto: string;
  practiques: string;
  projectes: string;
  username: string;
  nom: string;
  cognoms: string;
  email: string;
}

const API_URL = "https://api.fib.upc.edu/v2";

const strategy = new OAuth2Strategy(
  {
    tokenURL: process.env.FIB_TOKEN_URL || "",
    authorizationURL: process.env.FIB_AUTH_URL || "",
    clientID: process.env.FIB_CLIENT_ID || "",
    clientSecret: process.env.FIB_CLIENT_SECRET || "",
    callbackURL: process.env.FIB_REDIRECT_URI || "",
  },
  async (
    accessToken: string,
    refreshToken: string,
    _profile: any,
    done: any,
  ) => {
    const { username } = await getFibUser(accessToken);

    const user: jwtPayload = {
      accessToken,
      refreshToken,
      username: username,
    };

    return done(null, user);
  },
);

async function getFibUser(accessToken: string): Promise<userFibApi> {
  const response = await fetch(`${API_URL}/jo?format=json`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return (await response.json()) as userFibApi;
}

export default strategy;
