import { createHash } from "crypto";

type GravatarOptions = {
  size?: number,
  rating?: "g" | "pg" | "r" | "x",
  default?: "404" | "mp" | "identicon" | "monsterid" | "wavatar" | "retro" | "robohash" | "blank",
  forceDefault?: boolean
};

const BASE_URL = "https://www.gravatar.com/avatar/";

const generateMD5 = (input: string) => {
  return createHash("md5").update(input).digest("hex");
};

const convertToRecord = (options: GravatarOptions): Record<string, string> => {
  const params: Record<string, string> = {};

  if (options.size) {
    params.s = options.size.toString();
  }
  if (options.rating) {
    params.r = options.rating;
  }
  if (options.default) {
    params.d = options.default;
  }
  if (options.forceDefault) {
    params.f = options.forceDefault ? "y" : "n";
  }

  return params;
};

export const getGravatarURL = (email: string, options?: GravatarOptions) => {
  const fixedEmail = email.trim().toLowerCase();
  const hash = generateMD5(fixedEmail);

  const url = new URL(BASE_URL + hash);
  if (options) {
    const queryParams = new URLSearchParams(convertToRecord(options));
    url.search = queryParams.toString();
  }

  return url.href;
};
