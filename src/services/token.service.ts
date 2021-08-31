import { JwtPayload, sign, verify } from "jsonwebtoken";
import { IUser } from "../models/user.model";

export function generateToken(user: IUser) {
  return sign(
    {
      data: JSON.stringify({
        email: user.email,
        _id: user._id,
      }),
    },
    process.env.JWT_SECRET as string,
    { expiresIn: 60 }
  );
}

export function verifyToken(token: string): string {
  console.log(token);
  const payload = verify(token, process.env.JWT_SECRET as string);
  return typeof payload !== "string" ? payload.data : payload;
}
