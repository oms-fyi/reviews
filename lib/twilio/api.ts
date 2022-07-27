import { twilioClient } from "./client";

const VERIFY_SERVICE_SID = "VA8fe01f6ccca6c198aaaf592da51ad99c";

export async function sendCodeToUser(username: string): Promise<void> {
  const email = `${username}@gatech.edu`;

  // https://www.twilio.com/docs/verify/email
  await twilioClient.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verifications.create({ to: email, channel: "email" });
}

export async function doesUserCodeMatch(
  username: string,
  code: string
): Promise<boolean> {
  const email = `${username}@gatech.edu`;

  // https://www.twilio.com/docs/verify/api/verification-check
  const verificationCheck = await twilioClient.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: email, code });

  // Unfortunately, `status` is typed only as string, but the API docs give us
  // more clarity on the expected values.
  // > The status of the verification. Can be: pending, approved, or canceled.
  return verificationCheck.status === "approved";
}
