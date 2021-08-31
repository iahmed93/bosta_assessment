import { createTransport } from "nodemailer";

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(mailOptions: MailOptions) {
  const transporter = createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to send email to "${mailOptions.to}"`);
  }
}
