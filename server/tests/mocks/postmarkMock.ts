import { Message } from "postmark";
import { vi } from "vitest";

const sentEmails: Message[] = [];

const sendEmailMock = vi.fn(async (email: Message) => {
  console.log("...Mocking Postmark sendEmail...");
  sentEmails.push(email);
  return { Message: "OK", To: email.To };
});

vi.mock("postmark", () => {
  return {
    ServerClient: vi.fn().mockImplementation(() => ({
      sendEmail: sendEmailMock
    }))
  };
});

export const getSentEmails = () => {
  return sentEmails;
};

export const resetSentEmails = () => {
  sentEmails.length = 0;
};
