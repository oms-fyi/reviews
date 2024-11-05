import axios from "axios";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";

import { UserToken } from "src/@types";

import TokenExpired from "../exceptions/ExpiredToken";
import InvalidToken from "../exceptions/InvalidToken";

interface UserTokenPayload extends jose.JWTPayload {
  data: string;
}

async function verifyAndUpdateToken(
  req: NextRequest,
  res: NextResponse,
): Promise<{ response: NextResponse; isAuthenticated: Boolean }> {
  const tokenPayload = (await req.cookies.get("jwtToken")?.value) || "";

  const validToken = /^[\w-]+\.\.[\w-]+\.[\w-]+\.[\w-]+$/.test(tokenPayload);
  if (!tokenPayload || !validToken) {
    res = NextResponse.redirect(new URL("/login", req.nextUrl));
    res.cookies.delete("jwtToken");
    return { response: res, isAuthenticated: false };
  }

  try {
    const { userToken, refreshed } = await getUserToken(tokenPayload);

    if (refreshed) {
      res.cookies.set("jwtToken", await createToken(userToken));
    }
  } catch (error: any) {
    res = NextResponse.redirect(new URL("/login", req.nextUrl));
    res.cookies.delete("jwtToken");
    return { response: res, isAuthenticated: false };
  }

  return { response: res, isAuthenticated: true };
}

async function getUserToken(
  tokenPayload: string,
): Promise<{ userToken: UserToken; refreshed: Boolean }> {
  let userToken: UserToken;
  let refreshed: Boolean = false;

  try {
    userToken = await decryptToken(tokenPayload);
  } catch (error: any) {
    if (error instanceof TokenExpired) {
      // Refresh token
      userToken = await refreshToken(error.oldToken);
      refreshed = true;
    } else {
      throw new InvalidToken();
    }
  }

  return { userToken, refreshed };
}

async function createToken(userToken: UserToken): Promise<string> {
  const algo = "dir";
  const encAlgo = "A128CBC-HS256";
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET as string);
  const jwtToken = await new jose.EncryptJWT({
    data: JSON.stringify(userToken),
  } as UserTokenPayload)
    .setProtectedHeader({ alg: algo, enc: encAlgo })
    .setIssuedAt()
    .setExpirationTime("7d")
    .encrypt(secret);

  return jwtToken;
}

async function decryptToken(encryptedUserToken: string): Promise<UserToken> {
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET as string);

  const { payload } = await jose.jwtDecrypt(encryptedUserToken, secret);

  const userToken = JSON.parse(payload.data as string) as UserToken;

  if (userToken.expirationDate < Date.now()) {
    throw new TokenExpired(userToken);
  }

  return userToken;
}

async function refreshToken(payload: UserToken): Promise<UserToken> {
  const refreshToken = payload.refreshToken;
  const tokenURL = process.env.FIB_TOKEN_URL;
  const clientID = process.env.FIB_CLIENT_ID;
  const clientSecret = process.env.FIB_CLIENT_SECRET;

  if (!tokenURL || !clientID || !clientSecret) {
    throw new Error("Token URL, Client ID, or Client Secret not found!");
  }

  const response = await axios.post(
    tokenURL,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientID,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );
  const expirationDate = createExpirationDate(response.data.expires_in);

  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    expirationDate,
    usernameHash: payload.usernameHash,
  };
}

function createExpirationDate(expiresIn: number): number {
  return Date.now() + expiresIn * 1000;
}

export {
  verifyAndUpdateToken,
  getUserToken,
  createToken,
  createExpirationDate,
};
