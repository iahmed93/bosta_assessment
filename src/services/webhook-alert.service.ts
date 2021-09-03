import axios from "axios";
import { ICheckResult } from "../models/check-result.model";
import { ICheck } from "../models/check.model";
import { Alert } from "./alert.service";

export class WebhookAlert extends Alert {
  async send(check: ICheck, result: ICheckResult): Promise<void> {
    const data = JSON.stringify({
      content: `Check "${check.name}" is ${result.status}`,
      text: `Check "${check.name}" is ${result.status}`,
    });
    if (check.webhook) {
      await axios.post(check.webhook, data);
    } else {
      console.log(`No Webhook found for the check "${check.name}"`);
    }
  }
}
