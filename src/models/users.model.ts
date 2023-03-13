import { Document, model, Schema } from 'mongoose';
import { Role, User } from '@interfaces/users.interface';

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: [
      {
        type: String,
        required: true,
        enum: Role,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const userModel = model<User & Document>('User', userSchema);

export default userModel;
