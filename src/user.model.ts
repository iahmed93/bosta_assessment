import { model, Schema } from "mongoose";

interface IUser {
  email: string;
  password: string;
  isVerified: boolean;
  emailVerificationCode: string | undefined;
  tokens: string[] | undefined;
}

const schema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, required: true },
  emailVerificationCode: { type: String, required: true },
  tokens: [{ type: String }],
});

const UserModel = model<IUser>("User", schema);

export { UserModel, IUser };
