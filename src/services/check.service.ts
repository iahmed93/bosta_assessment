import { MongoServerError } from "mongodb";
import {CheckResultModel, ICheckResult} from "../models/check-result.model";
import { CheckModel, CheckStatus, ICheck } from "../models/check.model";
import { HttpError } from "../models/http-error.model";
import axios, { AxiosRequestConfig, Method } from "axios";
import { Agent } from "https";
import PromiseSocket from "promise-socket";
import { Socket } from "net";
import { Alert } from "./alert.service";
import { EmailAlert } from "./email-alert.service";
import { WebhookAlert } from "./webhook-alert.service";
import { ICheckReport } from "../models/check-report.model";

// TODO: Test Alerts and Webhooks
// TODO: Test all input of the add check
// TODO: Test the edit

const activeChecks: { [key: string]: NodeJS.Timer } = {};
const prevCheckResult: { [key: string]: ICheckResult } = {};
const alerts: Alert[] = [new EmailAlert(), new WebhookAlert()];

export async function addCheck(check: ICheck) {
  // check for required properties
  checkRequiredFields(check);
  // check if the name and userid found 
  const oldCheck = await CheckModel.findOne({ name: check.name, userId: check.userId });
  if (oldCheck){
    throw new HttpError(400, `Check with name "${check.name}" is already exist`);
  }
  // save check
  let doc = null;
  try {
    doc = new CheckModel(check);
    await doc.save();
  } catch (error) {
    if (error instanceof MongoServerError && error.code == 11000) {
      throw new HttpError(400, `Check with "${error.keyValue}" already exist`);
    }
    throw error;
  }
  check._id = doc._id;
  // start the checker
  startCheck(check);
}

export function startCheck(check: ICheck) {
  const timer = setInterval(() => checkUrl(check), check.interval! * 1000);
  activeChecks[check.name] = timer;
}

async function checkUrl(check: ICheck) {
  console.log(`[${check.name}]sending request to url ${check.url}`);
  // send the request
  let result: ICheckResult | null = null;
  let triesCount = 0;
  while (
    (result == null || result.status! === "down") &&
    triesCount < check.threshold!
  ) {
    if (check.protocol == "http" || check.protocol == "https") {
      result = await sendHttpRequest(check);
    } else if (check.protocol == "tcp") {
      result = await sendTcpRequest(check);
    }
    triesCount++;
  }
  // save the request result
  if (result) {
    if (
      prevCheckResult[check.name] &&
      prevCheckResult[check.name].status !== result.status
    ) {
      sendStatusAlert(check, result);
    }
    prevCheckResult[check.name] = result;
    saveCheckResult(result);
    updateCheckReport(check, result);
  }
}

async function sendHttpRequest(check: ICheck): Promise<ICheckResult> {
  const config: AxiosRequestConfig = {
    method: check.method as Method,
    url:
      `${check.protocol}://${check.url}` +
      (check.port ? `:${check.port}` : "") +
      (check.path ? `${check.path}` : ""),
    timeout: check.timeout! * 1000,
    httpsAgent: new Agent({ rejectUnauthorized: !check.ignoreSSL }),
  };
  if (check.authentication) {
    config.auth = {
      username: check.authentication.username,
      password: check.authentication.password,
    };
  }
  if (check.httpHeaders) {
    config.headers = check.httpHeaders;
  }
  if (
    check.assert &&
    check.assert.statusCode >= 200 &&
    check.assert.statusCode < 600
  ) {
    config.validateStatus = (status) => status == check.assert?.statusCode;
  }
  const startTime = Date.now();
  let checkResult: ICheckResult | null = null;
  try {
    const response = await axios(config);
    checkResult = {
      checkId: check._id!,
      timestamp: startTime,
      elapsedTime: Date.now() - startTime,
      status: "up",
    };
  } catch (error: any) {
    console.error(error);
    checkResult = {
      checkId: check._id!,
      timestamp: startTime,
      elapsedTime: Date.now() - startTime,
      status: "down",
    };
  }
  return checkResult;
}

async function sendStatusAlert(check: ICheck, result: ICheckResult) {
  for (let alert of alerts) {
    alert.send(check, result);
  }
}

async function sendTcpRequest(check: ICheck): Promise<ICheckResult> {
  const promiseSocket = new PromiseSocket(new Socket());
  promiseSocket.setTimeout(check.timeout!);
  const startTime = Date.now();
  try {
    await promiseSocket.connect(check.port ? check.port : 80, check.url);
    await promiseSocket.write("test");
    await promiseSocket.destroy();
    return {
      checkId: check._id!,
      elapsedTime: Date.now() - startTime,
      status: "up",
      timestamp: startTime,
    };
  } catch (error) {
    console.log(error);
    return {
      checkId: check._id!,
      elapsedTime: Date.now() - startTime,
      status: "down",
      timestamp: startTime,
    };
  }
}

async function saveCheckResult(checkResult: ICheckResult) {
  try {
    const doc = new CheckResultModel(checkResult);
    await doc.save();
  } catch (error) {
    console.error(error);
  }
}

export async function deleteCheck(name: string) {
  try {
    const check = await CheckModel.findOne({ name });
    if (check) {
      await check.delete();
    } else {
      throw new HttpError(400, `Check with name ${name} is not found`);
    }
  } catch (error: any) {
    console.error(error);
    throw new HttpError(500, error.message);
  }
}

export async function pauseCheck(name: string) {
  try {
    const check = await CheckModel.findOne({ name });
    if (check) {
      if (check.status == "paused") {
        return;
      }
      clearInterval(activeChecks[check.name]);
      check.status = "pasued" as CheckStatus;
      await check.save();
    } else {
      throw new HttpError(400, `Check with name ${name} is not found`);
    }
  } catch (error: any) {
    console.error(error);
    throw new HttpError(500, error.message);
  }
}

export async function activateCheck(name: string) {
  try {
    const check = await CheckModel.findOne({ name });
    if (check) {
      if (check.status == "active") {
        return;
      }
      startCheck(check);
      check.status = "active" as CheckStatus;
      await check.save();
    } else {
      throw new HttpError(400, `Check with name ${name} is not found`);
    }
  } catch (error: any) {
    console.error(error);
    throw new HttpError(500, error.message);
  }
}

function checkRequiredFields(check: ICheck) {
  if (!check.name) {
    throw new HttpError(400, "Missing Check name");
  }
  if (!check.url) {
    throw new HttpError(400, "Missing Check url");
  }
  if (check.ignoreSSL === null || check.ignoreSSL === undefined) {
    throw new HttpError(400, "Missing Check ignoreSSL");
  }
  if (!check.protocol) {
    throw new HttpError(400, "Missing Check protocol");
  }
}

export async function startActiveChecks() {
  try {
    const activeChecks = await CheckModel.find({ status: "active" });
    for (let check of activeChecks) {
      await startCheck(check);
    }
    if (activeChecks.length > 0) {
      console.log(`${activeChecks.length} active checks started`);
    } else {
      console.log(`No active checks found`);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function editCheck(check: ICheck) {
  // get the check from the database
  const oldCheck = await CheckModel.findOne({ name: check.name, userId: check.userId });
  if (!oldCheck) {
    throw new HttpError(400, `Check with name ${name} is not found`);
  }
  // pause the check
  await pauseCheck(check.name);
  // update and save the check
  await CheckModel.findByIdAndUpdate(oldCheck._id, check);
  // activate check back
  await activateCheck(check.name);
}

async function updateCheckReport (check: ICheck, result: ICheckResult){
  // get the report from the DB
  // if not found crate new one
  // increment the checksCount
  // if down => increment the outages
  // if down and prev check was down => add the interval time to the downtime
  // if up and prev check was up => add the interval time to the uptime
  // if up => add the result reponse time to the totalResponseTime then calculate average response time
  // add check result to history
}

export async function getCheckReportByUserId (userId: string, tags: string[]) // : ICheckReport
{
  // get all checks by userId
  // get all check reports using the list of checksIds
  // add the name of the check to each doc of the reports
}