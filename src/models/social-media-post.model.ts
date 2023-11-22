import mongoose, { Schema, Document } from 'mongoose';
import { SocialMedia, SocialMediaPost } from '@/interfaces/socia-media-post.interface';

const socialMediaPostSchema = new Schema(
  {
    socialMedia: { type: String, required: true, enum: SocialMedia },
    account: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    images: [
      {
        data: Buffer,
        contentType: String,
      },
    ],
  },
  { timestamps: true },
);

const SocialMediaPostModel = mongoose.model<SocialMediaPost & Document>('SocialMediaPost', socialMediaPostSchema);

export default SocialMediaPostModel;
