import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInput } from 'src/user/dto/user.input';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
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
    });
    console.log(await posts);
    return posts;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostInput: UpdatePostInput) {
    return `This action updates a #${id} post`;
  }

  remove(user: UserInput, PostId: string) {
    return this.postRepository.delete({ PostId, PostedBy: user });
  }
}
