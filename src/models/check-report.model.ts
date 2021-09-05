import { model, Schema } from "mongoose";
import { ICheckResult, UrlStatus } from "./check-result.model";

interface ICheckReport {
  status: UrlStatus;
  availability: number; // up checks / total number of checks X 100
  outages: number; // The total number of URL downtimes.
  downtime: number; // The total time, in seconds, of the URL downtime. => Interval between each check until it up again
  uptime: number; // The total time, in seconds, of the URL uptime.
  responseTime: number; // The average response time for the URL
  history: ICheckResult[];
  checkId: string;
  checksCount: number;
  totalResponseTime: number;
  checkName?: string;
}

// TODO: Schema for the CheckReport
const schema = new Schema<ICheckReport>({
  status: { type: String, required: true },
  availability: { type: Number, required: true },
  outages: { type: Number, required: true },
  downtime: { type: Number, required: true },
  uptime: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  history: [{ type: Object }],
  checkId: { type: String, required: true },
  checksCount: { type: Number, required: true },
  totalResponseTime: { type: Number, required: true },
  checkName: { type: String },
});

const CheckReportModel = model<ICheckReport>("CheckReport", schema);

export { ICheckReport, CheckReportModel };
