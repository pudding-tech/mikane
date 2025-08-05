import { ServerClient } from "postmark";
import env from "../env.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { PUD073, PUD074 } from "../types/errorCodes.ts";

const email = env.MIKANE_EMAIL;
const token = env.MIKANE_EMAIL_API_TOKEN;

/**
 * Send an email to a recipient
 * @param recipient Email address of recipient
 * @param subject Subject of email
 * @param html Contents of email, formatted as HTML
 */
export const sendEmail = async (recipient: string, subject: string, html: string) => {

  if (!email || !token) {
    throw new ErrorExt(PUD073);
  }

  const client = new ServerClient(token);

  return client.sendEmail({
    From: email,
    To: recipient,
    Subject: subject,
    HtmlBody: html
  })
  .then(res => {
    return res;
  })
  .catch(err => {
    throw new ErrorExt(PUD074, err);
  });
};
