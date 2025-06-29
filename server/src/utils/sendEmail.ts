import { createTransport } from "nodemailer";
import env from "../env.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { PUD073, PUD074 } from "../types/errorCodes.ts";

const email = env.MIKANE_EMAIL;
const password = env.MIKANE_EMAIL_PASSWORD;

/**
 * Send an email to a recipient
 * @param recipient Email address of recipient
 * @param subject Subject of email
 * @param html Contents of email, formatted as HTML
 */
export const sendEmail = async (recipient: string, subject: string, html: string) => {

  if (!email || !password) {
    throw new ErrorExt(PUD073);
  }

  const transporter = createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: password
    },
    tls: {
      ciphers: "SSLv3"
    }
  });

  const info = await transporter.sendMail({
    from: {
      name: "Mikane",
      address: email
    },
    to: recipient,
    subject: subject,
    html: html
  }).catch(err => { throw new ErrorExt(PUD074, err); });

  if (info.accepted) {
    return info;
  }
  else {
    throw new ErrorExt(PUD074, new Error("Something went wrong while sending email:\n" + info));
  }
};
