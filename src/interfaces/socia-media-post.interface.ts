export enum SocialMedia {
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
}

export interface SocialMediaPost {
  socialMedia: SocialMedia;
  account: string;
  text: string;
  images?: {
    data: Buffer;
    contentType: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
