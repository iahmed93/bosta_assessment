import { model, Schema } from "mongoose";

type CheckStatus = "active" | "paused";
type Protocol = "http" | "https" | "tcp";

interface ICheck {
  _id?: string;
  userId: string;
  name: string;
  url: string;
  protocol: Protocol;
  path?: string;
  webhook?: string;
  timeout?: number; // default 5 seconds
  interval?: number; // default 10 seconds
  threshold?: number; // default 1 failure
  authentication?: { username: string; password: string };
  httpHeaders?: { [key: string]: string }[];
  assert?: { statusCode: number };
  tags?: string[];
  ignoreSSL: boolean;
  status: CheckStatus;
  port?: number;
  method?: string;
}

const schema = new Schema<ICheck>({
  name: { type: String, required: true},
  url: { type: String, required: true },
  protocol: { type: String, require: true },
  path: { type: String },
  webhook: { type: String },
  timeout: { type: Number, default: 5 },
  interval: { type: Number, default: 10 },
  threshold: { type: Number, default: 1 },
  authentication: { username: { type: String }, password: { type: String } },
  httpHeaders: [{ type: Object }],
  assert: { statusCode: { type: Number } },
  tags: [{ type: String }],
  ignoreSSL: { type: Boolean, default: true },
  status: { type: String, default: "active" },
  port: { type: Number },
  method: { type: String },
  userId: { type: String, required: true },
});

const CheckModel = model<ICheck>("Check", schema);

export { CheckModel, ICheck, CheckStatus };
