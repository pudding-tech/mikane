const phoneNumberRegex = /^\d{8,}$/;

export const isPhoneNumber = (phoneNumber: string) => {
  return phoneNumberRegex.test(phoneNumber);
};
