import { sha512 } from "js-sha512";
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
    const usernameHash = await getFibUserHash(accessToken);
    const expirationDate = createExpirationDate(params.expires_in);

    const user: UserToken = {
      accessToken,
      refreshToken,
      expirationDate,
      usernameHash: usernameHash,
    };

    return done(null, user);
  },
);

async function getFibUserHash(accessToken: string): Promise<string> {
  const response = await fetch(`${API_URL}/jo?format=json`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { username } = (await response.json()) as userFibApi;

  return sha512(username + (process.env.USERNAME_HASH_SALT as string));
}

export default strategy;
