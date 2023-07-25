import env from "../env";
import { sendEmail } from "./sendEmail";

const url = env.ALLOWED_ORIGIN + "/delete-account/";

/**
 * Send an email to the recipient with password reset instructions
 * @param recipient Email address of recipient
 * @param key Key for password reset
 */
export const sendDeleteAccountEmail = async (recipient: string, key: string) => {

  const uriEncodedKey = encodeURIComponent(key);
  const subject = "Delete your Mikane account";
  const html = deleteAccountEmailHTML(uriEncodedKey);

  const sentMessageInfo = await sendEmail(recipient, subject, html);
  if (sentMessageInfo.accepted) {
    console.log(`Delete account email sent to ${sentMessageInfo.accepted}: ${sentMessageInfo.response}`);
  }
};

const deleteAccountEmailHTML = (key: string) => {
  return `<html>
            <body>
              <h1>You have requested to delete your Mikane account</h1>
              <div>Are you absolutely sure you want to delete your account?</div>
              <div>Remember, this action is permanent, and all your data will be gone.</div>
              <br>
              <a href="${url + key}" style="display: inline-block; padding: 10px 20px; background-color: #c2185b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Yes, delete my account</a>
              <br><br>
              <div>This link will stay active for 1 hour.</div>
              <div>If you changed your mind, you can simply ignore this email.</div>
              <div>If you didn't request this email, someone has access to your account, and you should immediately change your password and contact PuddingTech.</div>
            </body>
          </html>`;
};
