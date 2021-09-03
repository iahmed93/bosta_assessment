import { ICheckResult } from "./check-result.model";
import { CheckStatus } from "./check.model";

interface ICheckReport {
    status: CheckStatus;
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

export {ICheckReport}