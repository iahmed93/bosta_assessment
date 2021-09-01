import { createTransport } from "nodemailer";

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(mailOptions: MailOptions) {
  const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to "${mailOptions.to}" with subject "${mailOptions.subject}"`
    );
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to send email to "${mailOptions.to}"`);
  }
}
