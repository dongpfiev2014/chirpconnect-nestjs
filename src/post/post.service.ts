import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UserInput } from 'src/user/dto/user.input';
import { DeleteResponse } from './type/delete-response.type';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}
  async create(
    createPostInput: CreatePostInput,
    user: UserInput,
  ): Promise<Post> {
    try {
      let replyToPost: Post = null;
      if (createPostInput.ReplyTo) {
        replyToPost = await this.postRepository.findOne({
          where: { PostId: createPostInput.ReplyTo },
        });
        if (!replyToPost) {
          throw new BadRequestException('Reply post not found');
        }
      }
      const newPost = this.postRepository.create({
        ...createPostInput,
        PostedBy: user,
        ReplyTo: replyToPost,
      });
      return await this.postRepository.save(newPost);
    } catch (error) {
      throw new BadRequestException('Error creating post', error.message);
    }
  }

  async findAll(user: UserInput): Promise<Post[]> {
    const posts = this.postRepository.find({
      where: { PostedBy: user },
      relations: [
        'PostedBy',
        'LikedBy',
        'RetweetUsers',
        'OriginalPost',
        'OriginalPost.PostedBy',
        'OriginalPost.RetweetUsers',
        'OriginalPost.LikedBy',
        'ReplyTo',
        'ReplyTo.PostedBy',
      ],
      order: { CreatedAt: 'DESC' },
    });
    return posts;
  }

  async findOne(PostId: string, user: UserInput): Promise<Post> {
    const found = await this.postRepository.findOne({
      where: { PostId, PostedBy: user },
      relations: [
        'PostedBy',
        'LikedBy',
        'RetweetUsers',
        'ReplyTo',
        'ReplyTo.LikedBy',
        'ReplyTo.RetweetUsers',
        'ReplyTo.PostedBy',
        'Replies',
        'Replies.LikedBy',
        'Replies.RetweetUsers',
        'Replies.PostedBy',
        'Replies.ReplyTo.PostedBy',
      ],
    });

    if (!found) {
      throw new NotFoundException(`Post with ${PostId} not found`);
    }
    return found;
  }

  async updatePost(
    PostId: string,
    updatePostInput: UpdatePostInput,
    user: UserInput,
  ): Promise<Post> {
    const existingPost = await this.findOne(PostId, user);
    const updatedPost = Object.assign(existingPost, updatePostInput);
    await this.postRepository.save(updatedPost);
    return updatedPost;
  }

  async updatePostLikes(PostId: string, user: UserInput) {
    return this.entityManager.transaction(async (manager) => {
      const [post, userEntity] = await Promise.all([
        manager.findOne(Post, { where: { PostId }, relations: ['LikedBy'] }),
        manager.findOne(User, { where: { UserId: user.UserId } }),
      ]);

      if (!post) {
        throw new NotFoundException(`Post with ${PostId} not found`);
      }

      const hasLiked = post.LikedBy.some(
        (likedUser) => likedUser.UserId === user.UserId,
      );

      post.LikedBy = hasLiked
        ? post.LikedBy.filter((likedUser) => likedUser.UserId !== user.UserId)
        : [...post.LikedBy, userEntity];

      return await manager.save(post);
    });
  }

  async updateRetweet(PostId: string, user: UserInput) {
    return this.entityManager.transaction(async (manager) => {
      const [existingUser, OriginalPost] = await Promise.all([
        manager.findOne(User, { where: { UserId: user.UserId } }),
        manager.findOne(Post, {
          where: { PostId },
          relations: ['RetweetUsers', 'RetweetedPosts'],
        }),
      ]);

      const deletedPost = await manager.delete(Post, {
        OriginalPost: { PostId },
        PostedBy: existingUser,
      });

      if (deletedPost.affected === 0) {
        const repost = manager.create(Post, {
          PostedBy: existingUser,
          OriginalPost: OriginalPost,
        });

        const savedRepost = await manager.save(repost);
        OriginalPost.RetweetedPosts.push(savedRepost);
        OriginalPost.RetweetUsers.push(existingUser);
        return await manager.save(OriginalPost);
      } else {
        OriginalPost.RetweetUsers = OriginalPost.RetweetUsers.filter(
          (user) => user.UserId !== existingUser.UserId,
        );
        return await manager.save(OriginalPost);
      }
    });
  }

  async remove(PostId: string, user: UserInput): Promise<DeleteResponse> {
    const result = await this.postRepository.delete({ PostId, PostedBy: user });
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ${PostId} not found`);
    }
    return { success: true, message: 'Post successfully deleted' };
  }
}
