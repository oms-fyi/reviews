import RestException from 'twilio/lib/base/RestException';
import twilioClient from './client';

const VERIFY_SERVICE_SID = 'VA8fe01f6ccca6c198aaaf592da51ad99c';

export enum SendCodeResponse {
  SUCCESS,
  INVALID_EMAIL,
  MAX_ATTEMPTS_REACHED,
}

export default async function sendCodeToUser(
  username: string,
): Promise<SendCodeResponse> {
  const email = `${username}@gatech.edu`;

  try {
    // https://www.twilio.com/docs/verify/email
    await twilioClient.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({ to: email, channel: 'email' });

    return SendCodeResponse.SUCCESS;
  } catch (error: unknown) {
    if (error instanceof RestException) {
      switch (error.code) {
        case 60200: // https://www.twilio.com/docs/api/errors/60200
          return SendCodeResponse.INVALID_EMAIL;
        case 60203: // https://www.twilio.com/docs/api/errors/60203
          return SendCodeResponse.MAX_ATTEMPTS_REACHED;
        default:
          throw error;
      }
    } else {
      throw error;
    }
  }
}
