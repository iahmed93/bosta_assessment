import { Router } from "express";
import { HttpError } from "./http-error.model";
import { IUser } from "./user.model";
import { confirmSignUp, signUp } from "./user.service";

const userRouter = Router();

userRouter.put("/signup", async (req, res) => {
  console.log("/signup body", req.body);
  try {
    const newUser: IUser = {
      email: req.body.email,
      password: req.body.password,
      emailVerificationCode: undefined,
      isVerified: false,
      tokens: undefined,
    };
    await signUp(newUser);
    return res.status(200).send("Successful Signup");
  } catch (error: HttpError | any) {
    console.error("/signup ERROR", { error });
    if (error instanceof HttpError) {
      return res.status(error.code).send(error.message);
    }
    return res.status(500).send("Unkown Error");
  }
});

userRouter.post("/signin", (req, res) => {
  return res.send("Post Sign IN");
});

userRouter.post("/verify", (req, res) => {
  console.log("/verify body", req.body);
  try {
    confirmSignUp(req.body.code, req.body.email);
    return res.send("Email Verified");
  } catch (error: HttpError | any) {
    console.error("/verify ERROR", { error });
    if (error instanceof HttpError) {
      return res.status(error.code).send(error.message);
    }
    return res.status(500).send("Unkown Error");
  }
});

export = userRouter;
