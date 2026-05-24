import crypto, { createSecretKey, type KeyObject } from "node:crypto";

/** 16-byte IV (UTF-8). Must stay fixed so existing authorId values remain valid. */
const IV = "5183666c72eec9e4";

function getEncryptionKey(): KeyObject {
  // Bracket access avoids Turbopack/webpack inlining a stale empty value at compile time.
  const raw = process.env["ENCRYPTION_KEY"]?.trim().replace(/^['"]|['"]$/g, "");
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not configured. Add it to .env.local and restart the dev server.",
    );
  }

  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be 64 hex characters (32 bytes). Got ${key.length} bytes after decoding (input length ${raw.length}).`,
    );
  }

  return createSecretKey(new Uint8Array(key));
}

export function encryptAuthorId(username: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKey(), IV);
  const encrypted = cipher.update(username, "utf8", "base64");

  return encrypted + cipher.final("base64");
}

export function isCasAuthEnabled(): boolean {
  return Boolean(process.env.CAS_SERVER_URL);
}
