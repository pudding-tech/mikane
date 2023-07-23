import env from "../env";
import { User } from "../types/types";
import { sendEmail } from "./sendEmail";

const url = env.ALLOWED_ORIGIN + "/register/";

/**
 * Send an email to the recipient with password reset instructions
 * @param recipient Email address of recipient
 * @param key Key for password reset
 */
export const sendRegisterAccountEmail = async (recipient: string, key: string, byUser: User) => {

  const uriEncodedKey = encodeURIComponent(key);
  const subject = "You've been invited to Mikane";
  const html = passwordResetEmailHTML(uriEncodedKey, byUser);

  const sentMessageInfo = await sendEmail(recipient, subject, html);
  if (sentMessageInfo.accepted) {
    console.log(`Register user email sent to ${sentMessageInfo.accepted}: ${sentMessageInfo.response}`);
  }
};

const passwordResetEmailHTML = (key: string, byUser: User) => {
  return `<html>
            <body>
              <h1>You've been invited to join Mikane by ${byUser.name}!</h1>
              <div>Mikane is a web application for settling shared expenses from group trips, parties, etc.</div>
              <div>Please click the button below to register as a new user.</div>
              <br>
              <a href="${url + key}" style="display: inline-block; padding: 10px 20px; background-color: #c2185b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Register account</a>
              <br><br>
              <div>This link will stay active for 3 days.</div>
            </body>
          </html>`;
};
