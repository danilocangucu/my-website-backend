import { sendHohohoEmailService } from "./emailsService";

export const sendApplicationCodeEmail = async (
  email: string,
  verificationCode: string
): Promise<void> => {
  const subject = "Your Application Code";
  const text = `Here is your application code: ${verificationCode}`;
  const html = `<p>Here is your application code: <strong>${verificationCode}</strong></p>`;

  await sendHohohoEmailService(email, subject, text, html);
};
