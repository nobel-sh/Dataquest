import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, 'Please provide a username'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ email: 1 });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
