import { CheckStatus, Protocol } from "../models/check.model";
import { checkRequiredFields } from "./check.service";

describe("check service", () => {
  describe("checkRequiredFields()", () => {
    test("should throw an error if check name is missing", () => {
      const check = {
        name: "",
        url: "test.com",
        ignoreSSL: false,
        protocol: "https" as Protocol,
        userId: "test",
        status: "active" as CheckStatus,
      };
      try {
        checkRequiredFields(check);
      } catch (error) {
        expect(error).toEqual({
          code: 400,
          error: undefined,
          msg: "Missing Check name",
        });
      }
    });
    test("should throw an error if check url is missing", () => {
      const check = {
        name: "test",
        url: "",
        ignoreSSL: false,
        protocol: "https" as Protocol,
        userId: "test",
        status: "active" as CheckStatus,
      };
      try {
        checkRequiredFields(check);
      } catch (error) {
        expect(error).toEqual({
          code: 400,
          error: undefined,
          msg: "Missing Check url",
        });
      }
    });
    test("should throw an error if check ignoreSSL is missing", () => {
      const check = {
        name: "test",
        url: "test",
        ignoreSSL: undefined,
        protocol: "https" as Protocol,
        userId: "test",
        status: "active" as CheckStatus,
      };
      try {
        checkRequiredFields(check as any);
      } catch (error) {
        expect(error).toEqual({
          code: 400,
          error: undefined,
          msg: "Missing Check ignoreSSL",
        });
      }
    });
    test("should throw an error if check ignoreSSL is missing", () => {
      const check = {
        name: "test",
        url: "test",
        ignoreSSL: true,
        protocol: undefined,
        userId: "test",
        status: "active" as CheckStatus,
      };
      try {
        checkRequiredFields(check as any);
      } catch (error) {
        expect(error).toEqual({
          code: 400,
          error: undefined,
          msg: "Missing Check protocol",
        });
      }
    });
  });
});
