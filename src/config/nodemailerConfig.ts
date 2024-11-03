import dotenv from "dotenv";

dotenv.config();

console.log("ZOHO_EMAIL:", process.env.ZOHO_EMAIL);
console.log("ZOHO_PASSWORD:", process.env.ZOHO_PASSWORD);

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  recipients: string[];
}

const errorEmailConfig: EmailConfig = {
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL as string,
    pass: process.env.ZOHO_PASSWORD as string,
  },
  recipients: [process.env.MY_EMAIL as string],
};

export default errorEmailConfig;
