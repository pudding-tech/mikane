import env from "../env.ts";
import logger from "../utils/logger.ts";
import { User } from "../types/types.ts";
import { sendEmail } from "../utils/sendEmail.ts";

const url = env.ALLOWED_ORIGIN + "/register/";

/**
 * Send an email to the recipient with register account instructions
 * @param recipient Email address of recipient
 * @param key Key for registering account
 * @param byUser User sending the invitation
 */
export const sendRegisterAccountEmail = async (recipient: string, key: string, byUser: User) => {

  const uriEncodedKey = encodeURIComponent(key);
  const subject = "You've been invited to Mikane";
  const html = registerAccountEmailHTML(uriEncodedKey, byUser);

  const sentMessageInfo = await sendEmail(recipient, subject, html);
  if (sentMessageInfo.accepted) {
    logger.info(`Register account email sent to ${sentMessageInfo.accepted}: ${sentMessageInfo.response}`);
  }
};

const registerAccountEmailHTML = (key: string, byUser: User) => {
  return `<html>
            <body>
              <h1>You've been invited to join Mikane by ${byUser.name}!</h1>
              <div>Mikane is a web application for settling shared expenses from group trips, parties, and more.</div>
              <div>Please click the button below to register as a new user.</div>
              <br>
              <a href="${url + key}" style="display: inline-block; padding: 10px 20px; background-color: #c2185b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Register account</a>
              <br><br>
              <div>This link will remain active for 3 days.</div>
            </body>
          </html>`;
};
