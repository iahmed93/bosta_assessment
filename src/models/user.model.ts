import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";

interface IUser {
  _id?: ObjectId;
  email: string;
  password: string;
  isVerified: boolean;
  emailVerificationCode: string | undefined;
  tokens: string[];
  accessToken?: string;
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
