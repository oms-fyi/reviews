export const CAS_RETURN_TO_COOKIE = "cas_return_to";

export function getCasServiceUrl(): string {
  return (
    process.env.CAS_SERVICE_URL ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/cas/callback`
  );
}

export function getCasLoginUrl(): string {
  const casServer = process.env.CAS_SERVER_URL;
  if (!casServer) {
    throw new Error("CAS_SERVER_URL is not configured.");
  }

  const service = getCasServiceUrl();
  const url = new URL(`${casServer}/login`);
  url.searchParams.set("service", service);

  return url.toString();
}

export async function validateCasTicket(
  ticket: string,
): Promise<string | null> {
  const casServer = process.env.CAS_SERVER_URL;
  if (!casServer) {
    throw new Error("CAS_SERVER_URL is not configured.");
  }

  const service = getCasServiceUrl();
  const url = new URL(`${casServer}/serviceValidate`);
  url.searchParams.set("service", service);
  url.searchParams.set("ticket", ticket);

  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const body = await response.text();

  if (body.includes("authenticationFailure")) {
    return null;
  }

  // Mock CAS (and many servers) use the Yale namespace as default, so tags are
  // often <user> rather than <cas:user>.
  const match =
    body.match(/<cas:user>([^<]+)<\/cas:user>/) ??
    body.match(/<user>([^<]+)<\/user>/);

  return match?.[1] ?? null;
}
