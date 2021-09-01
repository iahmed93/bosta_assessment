import { model, Schema } from "mongoose";

type CheckStatus = "up" | "down";

interface ICheckResult {
  checkId: string;
  timestamp: number;
  elapsedTime: number;
  status: CheckStatus;
  request?: any;
  response?: any;
}

const schema = new Schema<ICheckResult>({
  timestamp: { type: Number, required: true },
  elapsedTime: { type: Number, required: true },
  status: { type: String, require: true },
  request: { type: Object },
  response: { type: Object },
  checkId: { type: String, required: true },
});

const CheckResultModel = model<ICheckResult>("CheckResult", schema);

export { CheckResultModel, ICheckResult, CheckStatus };
