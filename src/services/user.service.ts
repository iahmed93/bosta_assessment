import { MailOptions } from "./email.service";
import { sendEmail } from "./email.service";
import { HttpError } from "../models/http-error.model";
import { IUser, UserModel } from "../models/user.model";
import {
  compareHash,
  generateVerificationCode,
  hashedText,
  validateEmail,
} from "../utils/utils";
import { sign } from "jsonwebtoken";

const signUp = async (user: IUser): Promise<void> => {
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
  user.password = hashedText(user.password, 10);
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

const signIn = async (email: string, password: string): Promise<string> => {
  // Email and Password are required check
  if (!password) {
    throw new HttpError(400, "Password is required");
  }
  if (!email) {
    throw new HttpError(400, "Email is required");
  }
  // get user by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new HttpError(401, "Invalid Email or Password");
  }
  // validate password
  if (!compareHash(password, user.password)) {
    throw new HttpError(401, "Invalid Email or Password");
  }
  // generate token
  const token = generateToken(user);
  user.tokens.push(token);
  console.log(user);
  user.save();
  // return user data with the token
  return token;
};

export function generateToken(user: IUser) {
  return sign(
    {
      data: JSON.stringify({
        email: user.email,
      }),
    },
    process.env.JWT_SECRET as string,
    { expiresIn: 60 }
  );
}

export { signUp, signIn, confirmSignUp };
