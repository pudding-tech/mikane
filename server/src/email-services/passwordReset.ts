import env from "../env.ts";
import logger from "../utils/logger.ts";
import { sendEmail } from "../utils/sendEmail.ts";

const url = env.ALLOWED_ORIGIN + "/reset-password/";

/**
 * Send an email to the recipient with password reset instructions
 * @param recipient Email address of recipient
 * @param key Key for password reset
 */
export const sendPasswordResetEmail = async (recipient: string, key: string) => {

  const uriEncodedKey = encodeURIComponent(key);
  const subject = "Reset your password - Mikane";
  const html = passwordResetEmailHTML(uriEncodedKey);

  const sentMessageInfo = await sendEmail(recipient, subject, html);
  if (sentMessageInfo.To) {
    logger.info(`Password reset email sent to ${sentMessageInfo.To}: ${sentMessageInfo.Message}`);
  }
};

const passwordResetEmailHTML = (key: string) => {
  return `<html>
            <body>
              <h1>Mikane - Password reset request</h1>
              <div>A password reset has been requested for your account. Please click the button below to reset your password.</div>
              <br>
              <a href="${url + key}" style="display: inline-block; padding: 10px 20px; background-color: #c2185b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset password</a>
              <br><br>
              <div>This link will remain active for 1 hour.</div>
              <div>Didn't request a password reset? You can safely ignore this email.</div>
            </body>
          </html>`;
};
