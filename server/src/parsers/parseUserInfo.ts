import { User, UserBalance, Payment } from "../types/types.ts";

/**
 * Remove sensitive information for users who are not the signed-in user
 * @param users List of users
 * @param activeUserId ID of signed in user
 */
export const removeUserInfo = (users: User[], activeUserId: string) => {
  for (const user of users) {
    if (user.id !== activeUserId) {
      if (!user.publicEmail) {
        delete user.email;
      }
      if (!user.publicPhone) {
        delete user.phone;
      }
      delete user.superAdmin;
      delete user.publicEmail;
      delete user.publicPhone;
    }
  }
};

/**
 * Remove sensitive information for users who are not the signed-in user
 * @param userBalances List of user balances
 * @param activeUserId ID of signed in user
 */
export const removeUserInfoFromUserBalances = (userBalances: UserBalance[], activeUserId: string) => {
  for (const userBalance of userBalances) {
    if (userBalance.user.id !== activeUserId) {
      if (!userBalance.user.publicEmail) {
        delete userBalance.user.email;
      }
      if (!userBalance.user.publicPhone) {
        delete userBalance.user.phone;
      }
      delete userBalance.user.superAdmin;
      delete userBalance.user.publicEmail;
      delete userBalance.user.publicPhone;
    }
  }
};

/**
 * Remove sensitive information for users who are not the signed-in user
 * @param payments List of payments
 * @param activeUserId ID of signed in user
 */
export const removeUserInfoFromPayments = (payments: Payment[], activeUserId: string) => {
  const processedUsers = new Set<string>();

  for (const payment of payments) {
    if (!processedUsers.has(payment.sender.id) && payment.sender.id !== activeUserId) {
      if (!payment.sender.publicEmail) {
        delete payment.sender.email;
      }
      if (!payment.sender.publicPhone) {
        delete payment.sender.phone;
      }
      delete payment.sender.superAdmin;
      delete payment.sender.publicEmail;
      delete payment.sender.publicPhone;

      processedUsers.add(payment.sender.id);
    }
    if (!processedUsers.has(payment.receiver.id) && payment.receiver.id !== activeUserId) {
      if (!payment.receiver.publicEmail) {
        delete payment.receiver.email;
      }
      if (!payment.receiver.publicPhone) {
        delete payment.receiver.phone;
      }
      delete payment.receiver.superAdmin;
      delete payment.receiver.publicEmail;
      delete payment.receiver.publicPhone;

      processedUsers.add(payment.receiver.id);
    }
  }
};
