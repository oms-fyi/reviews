import { Strategy as OAuth2Strategy } from "passport-oauth2";

import { UserToken } from "src/@types";

import { createExpirationDate } from "../jwt";

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

export interface FibAuthParams {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
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
    params: FibAuthParams,
    _profile: any,
    done: any,
  ) => {
    const { username } = await getFibUser(accessToken);
    const expirationDate = createExpirationDate(params.expires_in);

    const user: UserToken = {
      accessToken,
      refreshToken,
      expirationDate,
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
