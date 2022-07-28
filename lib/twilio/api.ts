import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";
import { twilioClient } from "./client";

const VERIFY_SERVICE_SID = "VA8fe01f6ccca6c198aaaf592da51ad99c";

export async function sendCodeToUser(
  username: string
): Promise<VerificationInstance> {
  const email = `${username}@gatech.edu`;

  // https://www.twilio.com/docs/verify/email
  const verification = await twilioClient.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verifications.create({ to: email, channel: "email" });

  return verification;
}
