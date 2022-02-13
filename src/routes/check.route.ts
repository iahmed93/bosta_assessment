import { Request, Router } from "express";
import { ICheck } from "../models/check.model";
import { HttpError } from "../models/http-error.model";
import {
  activateCheck,
  addCheck,
  deleteCheck,
  editCheck,
  getCheckReportByUserId,
  pauseCheck,
} from "../services/check.service";
import { generateHttpResponse } from "../utils/utils";

const checkRouter = Router();

checkRouter.put("/", async (req, res) => {
  try {
    await addCheck(createCheckObject(req));
    res.json(generateHttpResponse(200, "Create Success"));
  } catch (error: HttpError | any) {
    if (error instanceof HttpError) {
      return res
        .status(error.code)
        .json(generateHttpResponse(error.code, error.msg));
    }
    return res
      .status(500)
      .json(generateHttpResponse(500, "Unkown Error", error));
  }
});

checkRouter.post("/", async (req, res) => {
  try {
    await editCheck(createCheckObject(req));
    res.json(generateHttpResponse(200, "Edit Success"));
  } catch (error: HttpError | any) {
    if (error instanceof HttpError) {
      return res
        .status(error.code)
        .json(generateHttpResponse(error.code, error.msg));
    }
    return res
      .status(500)
      .json(generateHttpResponse(500, "Unkown Error", error));
  }
});

checkRouter.post("/pause", async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json(generateHttpResponse(400, "Name is missing"));
    }
    await pauseCheck(req.body.name);
    return res.json(
      generateHttpResponse(200, `Check '${req.body.name}' paused`)
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return res
        .status(error.code)
        .json(generateHttpResponse(error.code, error.msg));
    }
    return res
      .status(500)
      .json(generateHttpResponse(500, "Unkown Error", error));
  }
});

checkRouter.post("/activate", async (req, res) => {
  try {
    if (!req.body.name) {
      return res
        .status(400)
        .json(generateHttpResponse(400, "Check name is missing"));
    }
    await activateCheck(req.body.name);
    return res.json(
      generateHttpResponse(200, `Check '${req.body.name}' activated`)
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return res
        .status(error.code)
        .json(generateHttpResponse(error.code, error.msg));
    }
    return res
      .status(500)
      .json(generateHttpResponse(500, "Unkown Error", error));
  }
});

checkRouter.delete("/", async (req, res) => {
  try {
    if (!req.body.name) {
      return res
        .status(400)
        .json(generateHttpResponse(400, "Check name is missing"));
    }
    await deleteCheck(req.body.name);
    return res.json(
      generateHttpResponse(200, `Check '${req.body.name}' deleted`)
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return res
        .status(error.code)
        .json(generateHttpResponse(error.code, error.msg));
    }
    return res
      .status(500)
      .json(generateHttpResponse(500, "Unkown Error", error));
  }
});

checkRouter.get("/report", async (req, res) => {
  // ?tags=test,test123
  let tags: string[] = [];
  if (req.query.tags) {
    const queryTags = req.query.tag as string;
    tags = queryTags.split(",");
  }
  try {
    const report = await getCheckReportByUserId(req.body.userId, tags);
    return res.json(generateHttpResponse(200, `Success`, report));
  } catch (error) {
    if (error instanceof HttpError) {
      return res
        .status(error.code)
        .json(generateHttpResponse(error.code, error.msg));
    }
    return res
      .status(500)
      .json(generateHttpResponse(500, "Unkown Error", error));
  }
});

function createCheckObject(req: Request): ICheck {
  const newCheck: ICheck = {
    userId: req.body.userId,
    name: req.body.name,
    url: req.body.url,
    protocol: req.body.protocol,
    ignoreSSL: req.body.ignoreSSL,
    timeout: req.body.timeout ? req.body.timeout : 5, // in seconds
    interval: req.body.interval ? req.body.interval : 10, // in seconds
    threshold: req.body.threshold ? req.body.threshold : 1, // default is one failure
    status: "active",
    method: req.body.method ? req.body.method : "get",
  };
  if (req.body.path) {
    newCheck.path = req.body.path;
  }
  if (req.body.port) {
    newCheck.port = req.body.port;
  }
  if (req.body.webhook) {
    newCheck.webhook = req.body.webhook;
  }
  if (
    req.body.authentication &&
    req.body.authentication.username &&
    req.body.authentication.password
  ) {
    newCheck.authentication = {
      username: req.body.authentication.username,
      password: req.body.authentication.password,
    };
  }
  if (req.body.httpHeaders) {
    newCheck.httpHeaders = [...req.body.httpHeaders];
  }
  if (req.body.assert && req.body.assert.statusCode) {
    newCheck.assert = { statusCode: req.body.assert.statusCode };
  }
  if (req.body.tags) {
    newCheck.tags = [...req.body.tags];
  }
  return newCheck;
}

export { checkRouter };
