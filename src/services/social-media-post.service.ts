import { isEmpty } from '@utils/util';
import SocialMediaPostModel from '@/models/social-media-post.model';
import { SocialMediaPost } from '@/interfaces/socia-media-post.interface';

class SocialMediaPostService {
  public async getSocialMediaPostById(id: string): Promise<SocialMediaPost> {
    return SocialMediaPostModel.findById(id);
  }

  public async saveSocialMediaPost(data: SocialMediaPost): Promise<SocialMediaPost> {
    if (isEmpty(data)) throw new Error('Data is empty');
    return SocialMediaPostModel.create(data);
  }

  public async getAllSocialMediaPosts(): Promise<SocialMediaPost[]> {
    return SocialMediaPostModel.find({});
  }

  public async getLatestSocialMediaPosts(): Promise<SocialMediaPost[]> {
    return SocialMediaPostModel.find({}).sort({ createdAt: -1 });
  }
}

export default SocialMediaPostService;
