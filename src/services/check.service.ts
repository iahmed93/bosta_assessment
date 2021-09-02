import { MongoServerError } from "mongodb";
import {
  CheckResultModel,
  ICheckResult,
  UrlStatus,
} from "../models/check-result.model";
import { CheckModel, CheckStatus, ICheck } from "../models/check.model";
import { HttpError } from "../models/http-error.model";
import axios, { AxiosRequestConfig, Method } from "axios";
import { Agent } from "https";
import { MailOptions, sendEmail } from "./email.service";
import { UserModel } from "../models/user.model";
import PromiseSocket from "promise-socket";
import { Socket } from "net";

// TODO: Test Pause
// TODO: Test Delete
// TODO: Test Activate

const activeChecks: { [key: string]: NodeJS.Timer } = {};
const lastCheckResult: { [key: string]: ICheckResult } = {};

export async function addCheck(check: ICheck) {
  // check for required properties
  checkRequiredFields(check);
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
      lastCheckResult[check.name] &&
      lastCheckResult[check.name].status !== result.status
    ) {
      sendStatusEmail(check, result.status);
    }
    lastCheckResult[check.name] = result;
    saveCheckResult(result);
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
      // request: result.request,
      // response: {
      //   statusCode: result.status,
      //   statusText: result.statusText,
      //   headers: result.headers,
      //   data: result.data,
      // },
    };
  } catch (error: any) {
    console.error(error);
    checkResult = {
      checkId: check._id!,
      timestamp: startTime,
      elapsedTime: Date.now() - startTime,
      status: "down",
      // request: error.request ? error.request : null,
      // response: error.response ? error.response : error.message,
    };
  }
  return checkResult;
}

async function sendStatusEmail(check: ICheck, status: UrlStatus) {
  const user = await UserModel.findById(check.userId);
  const mailOptions: MailOptions = {
    to: user!.email,
    from: "no-reply@test.com",
    subject: "Check Status",
    text: `Check "${check.name}" is ${status}`,
  };
  sendEmail(mailOptions);
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
  } catch (error) {
    console.error(error);
    throw new HttpError(500, error);
  }
}

export async function pauseCheck(name: string) {
  try {
    const check = await CheckModel.findOne({ name });
    if (check) {
      clearInterval(activeChecks[check.name]);
      check.status = "pasued" as CheckStatus;
      await check.save();
    } else {
      throw new HttpError(400, `Check with name ${name} is not found`);
    }
  } catch (error) {
    console.error(error);
    throw new HttpError(500, error);
  }
}

export async function activateCheck(name: string) {
  try {
    const check = await CheckModel.findOne({ name });
    if (check) {
      startCheck(check);
      check.status = "active" as CheckStatus;
      await check.save();
    } else {
      throw new HttpError(400, `Check with name ${name} is not found`);
    }
  } catch (error) {
    console.error(error);
    throw new HttpError(500, error);
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

// const check: ICheck = {
//   url: "google.com",
//   ignoreSSL: true,
//   name: "test",
//   protocol: "http",
//   interval: 10,
// };
// startCheck(check);

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
