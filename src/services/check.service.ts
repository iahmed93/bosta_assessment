import { MongoServerError } from "mongodb";
import { ICheckResult } from "../models/check-result.model";
import { CheckModel, ICheck } from "../models/check.model";
import { HttpError } from "../models/http-error.model";

const activeChecks: { [key: string]: any } = {};

export async function addCheck(check: ICheck) {
  // check for required properties
  checkRequiredFields(check);
  // save check
  try {
    const doc = new CheckModel(check);
    await doc.save();
  } catch (error) {
    if (error instanceof MongoServerError && error.code == 11000) {
      throw new HttpError(400, `${error.keyValue.name} is in use`);
    }
    throw error;
  }
  // start check thread
  startCheck(check);
}

export function startCheck(check: ICheck) {
  const timer = setInterval(() => checkUrl(check), check.interval! * 1000);
  activeChecks[check.name] = timer;
}

function checkUrl(check: ICheck) {
  console.log(`[${check.name}]sending request to url ${check.url}`);
}

function saveCheckResult(checkResult: ICheckResult) {}

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
