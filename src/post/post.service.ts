import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import {
  EntityManager,
  //  IsNull, Not,
  Repository,
} from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DeleteResponse } from './type/delete-response.type';
import { User } from 'src/user/entities/user.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectEntityManager() private entityManager: EntityManager,
    private notificationService: NotificationService,
  ) {}
  async create(
    createPostInput: CreatePostInput,
    UserId: string,
  ): Promise<Post> {
    try {
      let replyToPost: Post = null;
      if (createPostInput.ReplyTo) {
        replyToPost = await this.postRepository.findOne({
          where: { PostId: createPostInput.ReplyTo },
          relations: ['PostedBy'],
        });
        if (!replyToPost) {
          throw new BadRequestException('Reply post not found');
        }
      }
      const user = await this.userRepository.findOne({
        where: { UserId },
      });

      const newPost = this.postRepository.create({
        ...createPostInput,
        PostedBy: user,
        ReplyTo: replyToPost,
        ContentNoDiacritics: this.removeDiacritics(createPostInput.Content),
      });
      const result = await this.postRepository.save(newPost);

      if (createPostInput.ReplyTo) {
        await this.notificationService.insertNotification({
          UserToId: replyToPost.PostedBy.UserId,
          UserFromId: UserId,
          NotificationType: 'reply',
          EntityId: result.PostId,
        });
      }

      return result;
    } catch (error) {
      throw new BadRequestException('Error creating post', error.message);
    }
  }

  async findAll(
    UserId?: string,
    isReply?: boolean,
    followingOnly?: boolean,
    search?: string,
  ): Promise<Post[]> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.PostedBy', 'PostedBy')
      .leftJoinAndSelect('post.LikedBy', 'LikedBy')
      .leftJoinAndSelect('post.RetweetUsers', 'RetweetUsers')
      .leftJoinAndSelect('post.OriginalPost', 'OriginalPost')
      .leftJoinAndSelect('post.ReplyTo', 'ReplyTo')
      .leftJoinAndSelect('ReplyTo.PostedBy', 'ReplyToPostedBy')
      .leftJoinAndSelect('OriginalPost.PostedBy', 'OriginalPostPostedBy')
      .leftJoinAndSelect(
        'OriginalPost.RetweetUsers',
        'OriginalPostRetweetUsers',
      )
      .leftJoinAndSelect('OriginalPost.LikedBy', 'OriginalPostLikedBy')
      .orderBy('post.CreatedAt', 'DESC');

    if (UserId) {
      queryBuilder.andWhere('post.PostedBy = :UserId', { UserId });
    }

    if (isReply !== undefined && isReply !== null) {
      if (isReply) {
        queryBuilder.andWhere('post.ReplyTo IS NOT NULL');
      } else {
        queryBuilder.andWhere('post.ReplyTo IS NULL');
      }
    }

    if (followingOnly !== undefined && followingOnly !== null) {
      queryBuilder.andWhere(
        'post.PostedBy = :UserId OR post.PostedBy IN' +
          '(SELECT follow.FollowingId FROM User_Following follow WHERE follow.UserId = :UserId)',
        { UserId },
      );
    } else if (search) {
      const searchFullText = this.removeDiacritics(search);
      queryBuilder.andWhere(
        'CONTAINS(post.ContentNoDiacritics, :fullTextSearch) OR post.ContentNoDiacritics LIKE :substringSearch',
        {
          fullTextSearch: `("${searchFullText}" OR FORMSOF(Inflectional, "${searchFullText}"))`,
          substringSearch: `%${searchFullText}%`,
        },
      );
    }

    const posts = await queryBuilder.getMany();

    return posts;

    // Only find posts that relate to the user and replies

    // const relations = [
    //   'PostedBy',
    //   'LikedBy',
    //   'RetweetUsers',
    //   'OriginalPost',
    //   'OriginalPost.PostedBy',
    //   'OriginalPost.RetweetUsers',
    //   'OriginalPost.LikedBy',
    //   'ReplyTo',
    //   'ReplyTo.PostedBy',
    // ];

    // const whereCondition: any = { PostedBy: { UserId } };

    // if (isReply !== undefined && isReply !== null) {
    //   whereCondition.ReplyTo = isReply ? Not(IsNull()) : IsNull();
    // }

    // const posts = this.postRepository.find({
    //   where: whereCondition,
    //   relations: relations,
    //   order: { CreatedAt: 'DESC' },
    // });
    // return posts;
  }

  removeDiacritics(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
  async findPostByPinned(UserId: string, Pinned: boolean) {
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.PostedBy', 'PostedBy')
      .where('post.PostedBy = :UserId', { UserId })
      .andWhere('post.Pinned = :Pinned', { Pinned })
      .getMany();
    return posts.length ? posts : [];
  }

  async findOne(PostId: string): Promise<Post> {
    const found = await this.postRepository.findOne({
      where: { PostId },
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
    UserId: string,
  ): Promise<Post> {
    const existingPost = await this.postRepository.findOne({
      where: { PostId, PostedBy: { UserId } },
    });
    if (!existingPost) {
      throw new NotFoundException(
        `Post with ${PostId} not found or not owned by the user`,
      );
    }
    const updatedPost = Object.assign(existingPost, updatePostInput);
    await this.postRepository.save(updatedPost);
    return updatedPost;
  }

  async updatePostLikes(PostId: string, UserId: string) {
    return this.entityManager.transaction(async (manager) => {
      const [post, userEntity] = await Promise.all([
        manager.findOne(Post, {
          where: { PostId },
          relations: ['LikedBy', 'PostedBy'],
        }),
        manager.findOne(User, { where: { UserId } }),
      ]);

      if (!post) {
        throw new NotFoundException(`Post with ${PostId} not found`);
      }

      const hasLiked = post.LikedBy.some(
        (likedUser) => likedUser.UserId === UserId,
      );

      post.LikedBy = hasLiked
        ? post.LikedBy.filter((likedUser) => likedUser.UserId !== UserId)
        : [...post.LikedBy, userEntity];

      if (!hasLiked) {
        await this.notificationService.insertNotification({
          UserToId: post.PostedBy.UserId,
          UserFromId: UserId,
          NotificationType: 'postLike',
          EntityId: post.PostId,
        });
      }

      return await manager.save(post);
    });
  }

  async updateRetweet(PostId: string, UserId: string) {
    return this.entityManager.transaction(async (manager) => {
      const [existingUser, OriginalPost] = await Promise.all([
        manager.findOne(User, { where: { UserId } }),
        manager.findOne(Post, {
          where: { PostId },
          relations: ['RetweetUsers', 'RetweetedPosts', 'PostedBy'],
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

        await this.notificationService.insertNotification({
          UserToId: OriginalPost.PostedBy.UserId,
          UserFromId: UserId,
          NotificationType: 'retweet',
          EntityId: OriginalPost.PostId,
        });

        return await manager.save(OriginalPost);
      } else {
        OriginalPost.RetweetUsers = OriginalPost.RetweetUsers.filter(
          (user) => user.UserId !== existingUser.UserId,
        );
        return await manager.save(OriginalPost);
      }
    });
  }

  async remove(PostId: string, UserId: string): Promise<DeleteResponse> {
    const result = await this.postRepository.delete({
      PostId,
      PostedBy: { UserId },
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ${PostId} not found`);
    }
    return { success: true, message: 'Post successfully deleted' };
  }

  async updatePinned(PostId: string, UserId: string, Pinned: boolean) {
    return this.entityManager.transaction(async (manager) => {
      console.log(PostId, UserId, Pinned);
      let post;
      if (Pinned) {
        await manager
          .createQueryBuilder()
          .update('post')
          .set({ Pinned: false })
          .where('post.PostedBy = :UserId', { UserId })
          .andWhere('PostId != :PostId', { PostId })
          .execute();

        post = await manager
          .createQueryBuilder()
          .update('post')
          .set({ Pinned: true })
          .where('PostId = :PostId', { PostId })
          .output('INSERTED.*')
          .execute();
      } else {
        post = await manager
          .createQueryBuilder()
          .update('post')
          .set({ Pinned: false })
          .where('PostId = :PostId', { PostId })
          .output('INSERTED.*')
          .execute();
      }
      return post.raw[0];
    });
  }
}
