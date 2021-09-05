import { hashSync } from "bcrypt";
import {
  compareHash,
  generateVerificationCode,
  hashedText,
  validateEmail,
} from "./utils";

describe("utils", () => {
  describe("validateEmail()", () => {
    test("should return true for valid email format", () => {
      const email = "test@test.com";
      const actual = validateEmail(email);
      expect(actual).toBe(true);
    });
    test("should return false for invalid domain format", () => {
      const email = "test@tes";
      const actual = validateEmail(email);
      expect(actual).toBe(false);
    });
    test("should return false for missing @ sign", () => {
      const email = "testtest.com";
      const actual = validateEmail(email);
      expect(actual).toBe(false);
    });
  });
  describe("generateVerificationCode()", () => {
    test("should return code fo 4 digits", () => {
      const actual = generateVerificationCode(4);
      expect(actual.length).toBe(4);
      expect(actual).toMatch(/[0-9]*/);
    });
  });

  describe("hashedText()", () => {
    test("should return hashed text", () => {
      const actual = hashedText("test", 10);
      expect(actual).toContain("$2b$10$");
    });
  });

  describe("compareHash()", () => {
    test("should return true if the plainText is the hashedText", () => {
      const plainText = "test";
      const hashedText = hashSync("test", 10);
      const actual = compareHash(plainText, hashedText);
      expect(actual).toBe(true);
    });
    test("should return false if the plainText is not the hashedText", () => {
      let plainText = "test";
      const hashedText = hashSync("test", 10);
      plainText = "test1";
      const actual = compareHash(plainText, hashedText);
      expect(actual).toBe(false);
    });
  });
});
