import dotenv from "dotenv";
import { sendEmail } from "./sendEmail";

dotenv.config();
const url = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN + "/reset-password/" : "http://localhost:4200/reset-password/";

/**
 * Send an email to the recipient with password reset instructions
 * @param recipient Email address of recipient
 * @param key Key for password reset
 */
export const sendPasswordResetEmail = async (recipient: string, key: string) => {

  const uriEncodedKey = encodeURIComponent(key);
  const subject = "Reset your password - Pudding Debt";
  const html = passwordResetEmailHTML(uriEncodedKey);

  const sentMessageInfo = await sendEmail(recipient, subject, html);
  if (sentMessageInfo.accepted) {
    console.log(`Password reset email sent to ${sentMessageInfo.accepted}: ${sentMessageInfo.response}`);
  }
};

const passwordResetEmailHTML = (key: string) => {
  return `<html>
            <body>
              <h1>Pudding Debt - Password reset request</h1>
              <div>A password reset has been requested for your account. Please click the button below to reset your password.</div>
              <br>
              <a href="${url + key}" style="display: inline-block; padding: 10px 20px; background-color: #c2185b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset password</a>
              <br><br>
              <div>Didn't request a password reset? You can safely delete this email.</div>
            </body>
          </html>`;
};
