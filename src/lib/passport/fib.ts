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

const FIB_URL = process.env.FIB_URL || "";
const VERCEL_URL =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL || ""
    : process.env.VERCEL_BRANCH_URL || "";

const TOKEN_URL = `${FIB_URL}/${process.env.FIB_TOKEN_URL || ""}`;
const AUTH_URL = `${FIB_URL}/${process.env.FIB_AUTH_URL || ""}`;

const CALLBACK_URL = `${VERCEL_URL}/${process.env.CALLBACK_URL || ""}`;
const CLIENT_ID = process.env.FIB_CLIENT_ID || "";
const CLIENT_SECRET = process.env.FIB_CLIENT_SECRET || "";

const strategy = new OAuth2Strategy(
  {
    tokenURL: TOKEN_URL,
    authorizationURL: AUTH_URL,
    callbackURL: CALLBACK_URL,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
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
  const response = await fetch(`${FIB_URL}/jo?format=json`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { username } = (await response.json()) as userFibApi;

  return sha512(username + (process.env.USERNAME_HASH_SALT as string));
}

export default strategy;
