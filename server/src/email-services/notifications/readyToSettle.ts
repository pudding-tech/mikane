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
type ReceiverPayments = {
  receiver: User,
  payments: {
    sender: User,
    amount: number
  }[]
};

const url = env.ALLOWED_ORIGIN + "/events/";

/**
 * Send emails to all payment senders and receivers in an event
 * @param payments List of payments within an event
 * @param event Event to send payment emails for
 */
export const sendReadyToSettleEmails = async (paymentsInput: Payment[], event: Event) => {

  const subjectSenders = `${event.name} is now ready for settlement - Mikane`;
  const subjectReceivers = `${event.name}: You will soon receive payments - Mikane`;

  const senderPaymentsMap = new Map<string, SenderPayments>();
  const receiverPaymentsMap = new Map<string, ReceiverPayments>();

  paymentsInput.forEach(payment => {
    // Sender map
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

    // Receiver map
    if (!receiverPaymentsMap.has(payment.receiver.id)) {
      receiverPaymentsMap.set(payment.receiver.id, {
        receiver: payment.receiver,
        payments: []
      });
    }
    receiverPaymentsMap.get(payment.receiver.id)?.payments.push({
      sender: payment.sender,
      amount: payment.amount
    });
  });

  const senderPayments = Array.from(senderPaymentsMap.values());
  const receiverPayments = Array.from(receiverPaymentsMap.values());

  for (const senderPayment of senderPayments) {
    if (senderPayment.sender.guest) {
      continue;
    }
    if (!senderPayment.sender.email) {
      throw new Error("User " + senderPayment.sender.name + " missing email");
    }

    const html = senderEmailHTML(senderPayment, event);

    const sentMessageInfo = await sendEmail(senderPayment.sender.email, subjectSenders, html);
    if (sentMessageInfo.To) {
      logger.info(`'Ready to settle' email for event ${event.name} sent to ${sentMessageInfo.To}: ${sentMessageInfo.Message}`);
    }
  }

  for (const receiverPayment of receiverPayments) {
    if (receiverPayment.receiver.guest) {
      continue;
    }
    if (!receiverPayment.receiver.email) {
      throw new Error("User " + receiverPayment.receiver.name + " missing email");
    }

    const html = receiverEmailHTML(receiverPayment, event);

    const sentMessageInfo = await sendEmail(receiverPayment.receiver.email, subjectReceivers, html);
    if (sentMessageInfo.To) {
      logger.info(`'Ready to settle' email for event ${event.name} sent to ${sentMessageInfo.To}: ${sentMessageInfo.Message}`);
    }
  }
};

const senderEmailHTML = (senderPayment: SenderPayments, event: Event) => {
  return `<html>
            <body>
              <h2 style="color:#7d0a37;">${event.name} is now ready for settlement</h2>
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

const receiverEmailHTML = (receiverPayment: ReceiverPayments, event: Event) => {
  return `<html>
            <body>
              <h2 style="color:#0d4f11;">${event.name}: You will soon receive payments</h2>
              <div>As a participant in ${event.name}, you are receiving this notification to inform you that the event is now ready for settlement and you will soon receive payments.</div>
              <br>
              <div>
                The following people will pay you:
                ${receiverPayment.payments.map(payment => {
                  return `<div style="margin-left: 10px;">
                            - ${payment.sender.name}
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
              <div>If you have any questions, feel free to reach out. Thank you!</div>
            </body>
          </html>`;
};
