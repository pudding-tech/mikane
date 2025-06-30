import env from "../../env.ts";
import logger from "../../utils/logger.ts";
import { sendEmail } from "../../utils/sendEmail.ts";
import { Event, Payment, User } from "../../types/types.ts";

type SenderPayments = {
  sender: User,
  payments: {
    receiver: User,
    amount: number
  }[]
};

const url = env.ALLOWED_ORIGIN + "/events/";

/**
 * Send emails to all payment senders in an event
 * @param payments List of payments within an event
 * @param event Event to send payment emails for
 */
export const sendReadyToSettleEmails = async (paymentsInput: Payment[], event: Event) => {

  const subject = `${event.name} is now ready for settlement - Mikane`;

  const senderPaymentsMap = new Map<string, SenderPayments>();
  paymentsInput.forEach(payment => {
    if (!senderPaymentsMap.has(payment.sender.id)) {
      senderPaymentsMap.set(payment.sender.id, {
        sender: payment.sender,
        payments: []
      });
    }
    senderPaymentsMap.get(payment.sender.id)?.payments.push({
      receiver: payment.receiver,
      amount: payment.amount
    });
  });

  const senderPayments = Array.from(senderPaymentsMap.values());

  for (const senderPayment of senderPayments) {
    if (senderPayment.sender.guest) {
      continue;
    }
    if (!senderPayment.sender.email) {
      throw new Error("User " + senderPayment.sender.name + " missing email");
    }

    const html = readyToSettleEmailHTML(senderPayment, event);

    const sentMessageInfo = await sendEmail(senderPayment.sender.email, subject, html);
    if (sentMessageInfo.accepted) {
      logger.info(`'Ready to settle' email for event ${event.name} sent to ${sentMessageInfo.accepted}: ${sentMessageInfo.response}`);
    }
  }
};

const readyToSettleEmailHTML = (senderPayment: SenderPayments, event: Event) => {
  return `<html>
            <body>
              <h1>${event.name} is now ready for settlement</h1>
              <div>As a participant in ${event.name}, you are receiving this notification to inform you that it is time to settle your expenses.</div>
              <br>
              <div>
                You need to pay:
                ${senderPayment.payments.map(payment => {
                  return `<div style="margin-left: 10px;">
                            - ${payment.receiver.name}
                            <span style="display: inline-block; background-color: #ff85b65e; padding: 1px 4px; margin-bottom: 2px; border-radius: 4px;">
                              ${payment.amount} kr
                            </span>
                          </div>`;
                }).join("")}
                <br>
                Click the button below to see more details.
              </div>
              <br>
              <a href="${url + event.id}/payment" style="display: inline-block; padding: 10px 20px; background-color: #c2185b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">See payments</a>
              <br><br>
              <div>Please pay your share as soon as possible. Thank you!</div>
            </body>
          </html>`;
};
