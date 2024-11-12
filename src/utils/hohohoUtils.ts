import { randomBytes } from "crypto";

export const generateVerificationCode = (): string => {
  const randomValues = randomBytes(6);

  let code = "";
  for (let i = 0; i < 6; i++) {
    code += (randomValues[i] % 10).toString();
  }

  return code;
};
