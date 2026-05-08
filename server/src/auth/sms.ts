import { env } from "../env.js";

// In dev: log to server console + return code in response so the client can auto-fill.
// In prod: replace with Twilio / MSG91 / your provider.
export async function sendSms(phone: string, code: string): Promise<void> {
  if (env.isDev) {
    // eslint-disable-next-line no-console
    console.log(`\n[SMS:DEV] -> ${phone}: your Streak OTP is ${code}\n`);
    return;
  }
  // TODO: integrate real SMS provider here, e.g.:
  //   await twilio.messages.create({ to: phone, from: ..., body: ... })
  // eslint-disable-next-line no-console
  console.warn(`[SMS] No production provider configured. Phone=${phone}`);
}
