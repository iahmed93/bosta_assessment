import { Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { IUser, UserModel } from "../models/user.model";
import { verifyToken } from "../services/token.service";
import { generateHttpResponse } from "../utils/utils";

export async function auth(req: Request, res: Response, next: any) {
  try {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json(generateHttpResponse(401, "Missing Authorization Token"));
    }
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json(generateHttpResponse(401, "Invalid Token Format"));
    }
    let payload: { email: string; _id: string } | null = null;
    try {
      payload = JSON.parse(verifyToken(token));
    } catch (error: JsonWebTokenError | any) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json(generateHttpResponse(401, "Token Expired Error"));
      }
    }
    const user = await UserModel.findById(payload!._id);
    if (!user || user.email !== payload!.email) {
      return res.status(401).json(generateHttpResponse(401, "User not found"));
    }
    if (user.tokens.indexOf(token) === -1) {
      return res.status(401).json(generateHttpResponse(401, "Invalid Token"));
    }
    req.body.userId = payload?._id;
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(generateHttpResponse(500, "Unknown Error", error));
  }
}
