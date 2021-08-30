import { MailOptions } from "./email.service";
import { sendEmail } from "./email.service";
import { User } from "./user.model";
import { generateVerificationCode, hashPassword, validateEmail } from "./utils";

const signUp = async (user: User) => {
  // validate email format
  if (!validateEmail(user.email)) {
    throw new Error("Invalid Email");
  }
  // generate email verification code
  user.emailVerificationCode = generateVerificationCode(4);
  // hash password
  user.password = await hashPassword(user.password, 10);
  // save user
  // send email with the verification code
  const mailOptions: MailOptions = {
    toAddress: user.email,
    fromAddress: "no-reply@test.com",
    subject: "Verify Email",
    text: `Verification code: ${user.emailVerificationCode}`,
  };
  sendEmail(mailOptions);
};

const confirmSignUp = (code: string, email: string) => {
  // verify email format
  // get user by email
  // check if the user is not verified, else return an error
  // validate the code, if not match return an error
  // if code matched, update the isVerified flag
  // return true;
};

const signIn = (email: string, password: string) => {
  // get user by email
  // validate password
  // generate token
  // return user data with the token
};

export { signUp, signIn, confirmSignUp };
