import clientFactory from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("Twilio config not found!");
}

const twilioClient = clientFactory(accountSid, authToken);

export { twilioClient };
