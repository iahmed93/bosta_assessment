import { MailOptions, sendEmail } from "./email.service";
import { Alert } from "./alert.service";
import { ICheckResult } from "../models/check-result.model";
import { ICheck } from "../models/check.model";
import { UserModel } from "../models/user.model";

export class EmailAlert extends Alert {
  async send(check: ICheck, result: ICheckResult): Promise<void> {
    const user = await UserModel.findById(check.userId);
    const mailOptions: MailOptions = {
      to: user!.email,
      from: "no-reply@test.com",
      subject: "Check Status",
      text: `Check "${check.name}" is ${result.status}`,
    };
    sendEmail(mailOptions);
  }
}
