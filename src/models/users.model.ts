import { Document, model, Schema } from 'mongoose';
import { Role, User } from '@interfaces/users.interface';

const userSchema: Schema = new Schema({
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
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
