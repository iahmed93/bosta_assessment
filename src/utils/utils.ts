import { compareSync, hashSync } from "bcrypt";
import { HttpResponse } from "../models/http-resp.model";

export function validateEmail(email: string): boolean {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function generateVerificationCode(length: number): string {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * 10)];
  }
  return code;
}

export function hashedText(password: string, saltRounds: number): string {
  return hashSync(password, saltRounds);
}

export function compareHash(plainText: string, hashedText: string): boolean {
  return compareSync(plainText, hashedText);
}

export function generateHttpResponse(
  code: number,
  msg: string,
  payload: any = null
): HttpResponse {
  return {
    code,
    msg,
    payload,
  };
}
