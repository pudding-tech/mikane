import { createTransport } from "nodemailer";
import dotenv from "dotenv";
import { ErrorExt } from "../types/errorExt";
import { PUD073, PUD074 } from "../types/errorCodes";

dotenv.config();
const email = process.env.PUDDINGDEBT_EMAIL;
const password = process.env.PUDDINGDEBT_EMAIL_PASSWORD;

/**
 * Send an email to a recipient
 * @param recipient Email address of recipient
 * @param subject Subject of email
 * @param html Ccontents of email, in HTML format
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
      name: "Pudding Debt",
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
