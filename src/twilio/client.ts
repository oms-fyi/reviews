import clientFactory from "twilio";
import type { Twilio } from "twilio";

let twilioClient: Twilio | undefined;

export function getTwilioClient(): Twilio {
  if (!twilioClient) {
    const accountSid = process.env["TWILIO_ACCOUNT_SID"];
    const authToken = process.env["TWILIO_AUTH_TOKEN"];

    if (!accountSid || !authToken) {
      throw new Error("Twilio config not found!");
    }

    twilioClient = clientFactory(accountSid, authToken);
  }

  return twilioClient;
}
