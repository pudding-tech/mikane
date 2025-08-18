import env from "../../env.ts";
import logger from "../../utils/logger.ts";
import { sendEmail } from "../../utils/sendEmail.ts";
import { Event, User } from "../../types/types.ts";

const url = env.ALLOWED_ORIGIN + "/events/";

/**
 * Send emails to all participants in an event to remind them to add expenses
 * @param users List of users participating in the event
 * @param event Event to send reminder emails for
 * @param cutoffDate Optional planned date for setting event to 'ready to settle'
 */
export const sendAddExpensesReminderEmails = async (users: User[], event: Event, cutoffDate?: Date) => {

  const subject = cutoffDate
    ? `Reminder: Add your expenses for ${event.name} before ${cutoffDate.toLocaleDateString()} - Mikane`
    : `Reminder: Add your expenses for ${event.name} before settlement - Mikane`;

  for (const user of users) {
    if (user.guest) {
      continue;
    }
    if (!user.email) {
      throw new Error("User " + user.name + " missing email");
    }

    const html = addExpensesReminderEmailHTML(user, event, cutoffDate);

    const sentMessageInfo = await sendEmail(user.email, subject, html);
    if (sentMessageInfo.To) {
      logger.info(`'Add expenses reminder' email for event ${event.name} sent to ${sentMessageInfo.To}: ${sentMessageInfo.Message}`);
    }
  }
};

const addExpensesReminderEmailHTML = (user: User, event: Event, cutoffDate?: Date) => {
  const cutoffText = cutoffDate
    ? `<div><strong>Important:</strong> Settlement is scheduled to begin on <span style="color:#c2185b;">${cutoffDate.toLocaleDateString()}</span>. Please make sure all your expenses are entered before this date.</div>`
    : "<div>Settlement will begin soon, so please review your records and add any missing expenses.</div>";

  return `<html>
            <body>
              <h2>${event.name} - Reminder to submit your expenses</h2>
              <div>As a participant in ${event.name}, this is a friendly reminder to log any expenses you haven't yet added.</div>
              ${cutoffText}
              <br>
              <div>Click the button below to go to Mikane and add your expenses.</div>
              <br>
              <a href="${url + event.id}/expenses" style="display: inline-block; padding: 10px 20px; background-color: #c2185b; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">See expenses</a>
              <br><br>
              <div>Thank you for keeping your expenses up to date!</div>
            </body>
          </html>`;
};
