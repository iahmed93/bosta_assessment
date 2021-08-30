import { createTransport } from "nodemailer";

export interface MailOptions {
  fromAddress: string;
  toAddress: string;
  subject: string;
  text: string;
}

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(mailOptions: MailOptions) {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to send email to "${mailOptions.toAddress}"`);
  }
}
