import env from "../env.ts";
import logger from "../utils/logger.ts";
import { sendEmail } from "../utils/sendEmail.ts";

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
  if (sentMessageInfo.To) {
    logger.info(`Delete account email sent to ${sentMessageInfo.To}: ${sentMessageInfo.Message}`);
  }
};

const deleteAccountEmailHTML = (key: string) => {
  return `<html>
            <body>
              <h1>You have requested to delete your Mikane account</h1>
              <div>Are you absolutely sure you want to delete your account?</div>
              <div>This action is permanent and will result in the loss of all your data.</div>
              <br>
              <div>Click the button below to confirm:</div>
              <br>
              <a href="${url + key}" style="display: inline-block; padding: 10px 20px; background-color: #c2185b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Yes, delete my account</a>
              <br><br>
              <div>This link will remain active for 1 hour.</div>
              <div>If you changed your mind, you can simply ignore this email.</div>
              <div>If you didn't request this, someone may have access to your account. Please immediately change your password and contact the Mikane team.</div>
            </body>
          </html>`;
};
