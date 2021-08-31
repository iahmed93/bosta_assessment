import { Router } from "express";
import { HttpError } from "./http-error.model";
import { IUser } from "./user.model";
import { signUp } from "./user.service";

const userRouter = Router();

userRouter.put("/signup", async (req, res) => {
  console.log("/signup request");
  try {
    const newUser: IUser = {
      email: req.body.email,
      password: req.body.password,
      emailVerificationCode: undefined,
      isVerified: false,
      tokens: undefined,
    };
    console.log("/signup", newUser);
    await signUp(newUser);
    return res.status(200).send("Successful Signup");
  } catch (error: HttpError | any) {
    console.log({ error });
    return res.status(error.code).send(error.message);
  }
});

userRouter.post("/signin", (req, res) => {
  return res.send("Post Sign IN");
});

userRouter.post("/verify", (req, res) => {
  return res.send("Post Sign IN");
});

export = userRouter;
