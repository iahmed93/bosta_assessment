import { MailOptions } from "./email.service";
import { sendEmail } from "./email.service";
import { HttpError } from "../models/http-error.model";
import { IUser, UserModel } from "../models/user.model";
import {
  generateVerificationCode,
  hashPassword,
  validateEmail,
} from "../utils";

const signUp = async (user: IUser) => {
  // Email and Password are required check
  if (!user.password) {
    throw new HttpError(400, "Password is required");
  }
  if (!user.email) {
    throw new HttpError(400, "Email is required");
  }
  // validate email format
  if (!validateEmail(user.email)) {
    throw new HttpError(400, "Invalid email format");
  }
  // check if user already exist
  const oldUser = await UserModel.findOne({ email: user.email });
  if (oldUser) {
    throw new HttpError(400, "Email already exist");
  }
  // generate email verification code
  user.emailVerificationCode = generateVerificationCode(4);
  // hash password
  user.password = await hashPassword(user.password, 10);
  // save user
  try {
    const doc = new UserModel(user);
    await doc.save();
  } catch (error) {
    throw new HttpError(500, "Failed to save to DB");
  }

  // send email with the verification code
  const mailOptions: MailOptions = {
    to: user.email,
    from: "no-reply@test.com",
    subject: "Verify Email",
    text: `Verification code: ${user.emailVerificationCode}`,
  };
  sendEmail(mailOptions);
};

const confirmSignUp = async (code: string, email: string): Promise<boolean> => {
  if (!email) {
    throw new HttpError(400, "Email is required");
  }
  // verify email format
  if (!validateEmail(email)) {
    throw new HttpError(400, "Invalid email format");
  }
  // get user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new HttpError(400, "email not found");
  }
  // check if the user is not verified, else return an error
  if (user.isVerified) {
    throw new HttpError(400, "email is verified");
  }
  // validate the code, if not match return an error
  if (user.emailVerificationCode == code) {
    user.isVerified = true;
    await user.save();
    return true;
  }
  // if code matched, update the isVerified flag
  return false;
};

const signIn = (email: string, password: string) => {
  // get user by email
  // validate password
  // generate token
  // return user data with the token
};

export { signUp, signIn, confirmSignUp };
