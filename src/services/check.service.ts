import { MongoServerError } from "mongodb";
import { CheckResultModel, ICheckResult } from "../models/check-result.model";
import { CheckModel, ICheck } from "../models/check.model";
import { HttpError } from "../models/http-error.model";
import axios, { AxiosRequestConfig, Method } from "axios";
import { Agent } from "https";
import { Socket } from "net";
import PromiseSocket from "promise-socket";

const activeChecks: { [key: string]: any } = {};

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
      throw new HttpError(400, `${error.keyValue.name} is in use`);
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
  if (check.protocol == "http" || check.protocol == "https") {
    result = await sendHttpRequest(check);
  } else if (check.protocol == "tcp") {
    result = await sendTcpRequest(check);
  }
  // save the request result
  if (result) {
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
  if (check.assert) {
    config.validateStatus = (status) => status == check.assert?.statusCode;
  }
  const startTime = Date.now();
  try {
    const result = await axios(config);
    return {
      checkId: check._id!,
      timestamp: startTime,
      elapsedTime: Date.now() - startTime,
      status: "up",
      // request: result.request,
      response: {
        statusCode: result.status,
        statusText: result.statusText,
        headers: result.headers,
        data: result.data,
      },
    };
  } catch (error: any) {
    console.error(error);
    return {
      checkId: check._id!,
      timestamp: startTime,
      elapsedTime: Date.now() - startTime,
      status: "down",
      request: error.request ? error.request : null,
      response: error.response ? error.response : error.message,
    };
  }
}
async function sendTcpRequest(check: ICheck): Promise<ICheckResult> {
  // const promiseSocket = new PromiseSocket(new Socket());
  // promiseSocket.setTimeout(check.timeout!);
  // await promiseSocket.connect(check.port!, check.url);
  // if (promiseSocket)

  return {
    checkId: check._id!,
    elapsedTime: 0,
    status: "up",
    timestamp: 1234,
  };
}

async function saveCheckResult(checkResult: ICheckResult) {
  try {
    const doc = new CheckResultModel(checkResult);
    await doc.save();
  } catch (error) {
    console.error(error);
  }
}

export function deleteCheck(check: ICheck) {}

export function pauseCheck(check: ICheck) {}

export function activateCheck(check: ICheck) {}

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
