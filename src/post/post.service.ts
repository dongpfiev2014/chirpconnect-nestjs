import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInput } from 'src/user/dto/user.input';
import { DeleteResponse } from './type/delete-response.type';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(
    createPostInput: CreatePostInput,
    user: UserInput,
  ): Promise<Post> {
    try {
      const newPost = this.postRepository.create({
        ...createPostInput,
        PostedBy: user,
      });
      return await this.postRepository.save(newPost);
    } catch (error) {
      throw new BadRequestException('Error creating post', error.message);
    }
  }

  async findAll(user: UserInput): Promise<Post[]> {
    const posts = this.postRepository.find({
      where: { PostedBy: user },
      relations: ['PostedBy'],
      order: { CreatedAt: 'DESC' },
    });
    return posts;
  }

  async findOne(PostId: string, user: UserInput): Promise<Post> {
    const found = await this.postRepository.findOne({
      where: { PostId, PostedBy: user },
      relations: ['PostedBy', 'LikedBy'],
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
    const post = await this.postRepository.findOne({
      where: { PostId },
      relations: ['LikedBy'],
    });
    const userEntity = await this.userRepository.findOne({
      where: { UserId: user.UserId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ${PostId} not found`);
    }
    // Check if user already liked the post
    const hasLiked = post.LikedBy.some(
      (likedUser) => likedUser.UserId === user.UserId,
    );

    if (hasLiked) {
      // Remove user from the likes array
      post.LikedBy = post.LikedBy.filter(
        (likedUser) => likedUser.UserId !== user.UserId,
      );
    } else {
      // Add user to the likes array
      post.LikedBy.push(userEntity);
    }
    return await this.postRepository.save(post);
  }

  async remove(PostId: string, user: UserInput): Promise<DeleteResponse> {
    const result = await this.postRepository.delete({ PostId, PostedBy: user });
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ${PostId} not found`);
    }
    return { success: true, message: 'Post successfully deleted' };
  }
}
