import { ICheckResult } from "../models/check-result.model";
import { ICheck } from "../models/check.model";

export abstract class Alert {
  abstract send(check: ICheck, result: ICheckResult): void;
}
