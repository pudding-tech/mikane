const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

export const isEmail = (email: string) => {
  if (!email || email.length > 254) {
    return false;
  }

  const valid = emailRegex.test(email);
  if (!valid) {
    return false;
  }

  const parts = email.split("@");
  if (parts[0].length > 64) {
    return false;
  }

  const domain = parts[1].split(".");
  if (domain.some(part => part.length > 63)) {
    return false;
  }

  return true;
};
