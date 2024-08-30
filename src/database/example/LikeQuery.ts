//*Sử Dụng Truy Vấn Bảng Liên Kết

// import { EntityManager, InjectEntityManager } from '@nestjs/typeorm';
// import { Injectable } from '@nestjs/common';
// import { UserLikedPosts } from './user-liked-posts.entity';

// @Injectable()
// export class SomeService {
//   constructor(
//     @InjectEntityManager()
//     private readonly entityManager: EntityManager,
//   ) {}

//   async getLikesByPost(postId: string): Promise<UserLikedPosts[]> {
//     return await this.entityManager.find(UserLikedPosts, {
//       where: { postPostId: postId },
//     });
//   }

//   async addLike(userId: string, postId: string): Promise<void> {
//     const userLike = new UserLikedPosts();
//     userLike.userUserId = userId;
//     userLike.postPostId = postId;
//     await this.entityManager.save(UserLikedPosts, userLike);
//   }

//   async removeLike(userId: string, postId: string): Promise<void> {
//     await this.entityManager.delete(UserLikedPosts, {
//       userUserId: userId,
//       postPostId: postId,
//     });
//   }
// }

//*Sử Dụng QueryBuilder

// import { EntityManager, getManager } from 'typeorm';
// import { UserLikedPosts } from './user-liked-posts.entity';

// @Injectable()
// export class SomeService {
//   async getLikesByPost(postId: string): Promise<any[]> {
//     const manager = getManager();
//     return manager
//       .createQueryBuilder()
//       .select()
//       .from(UserLikedPosts, 'user_liked_posts')
//       .where('user_liked_posts.postPostId = :postId', { postId })
//       .getMany();
//   }

//   async addLike(userId: string, postId: string): Promise<void> {
//     const manager = getManager();
//     await manager
//       .createQueryBuilder()
//       .insert()
//       .into(UserLikedPosts)
//       .values({ userUserId: userId, postPostId: postId })
//       .execute();
//   }

//   async removeLike(userId: string, postId: string): Promise<void> {
//     const manager = getManager();
//     await manager
//       .createQueryBuilder()
//       .delete()
//       .from(UserLikedPosts)
//       .where('userUserId = :userId AND postPostId = :postId', {
//         userId,
//         postId,
//       })
//       .execute();
//   }
// }

//! Tối ưu Query và Caching

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Post } from './post.entity';
// import { User } from './user.entity';
// import { Cache } from 'cache-manager';
// @Injectable()
// export class PostService {
//   constructor(
//     @InjectRepository(Post)
//     private postsRepository: Repository<Post>,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     private cacheManager: Cache, // Inject your cache manager here
//   ) {}
//   async updatePostLikes(PostId: string, userId: string): Promise<Post> {
//     let post = await this.postsRepository.findOne({
//       where: { id: PostId },
//     });
//     if (!post) {
//       throw new Error('Post not found');
//     }
//     const user = await this.userRepository.findOne({
//       where: { id: userId },
//     });
//     if (!user) {
//       throw new Error('User not found');
//     }
//     // Check if user has already liked the post
//     const isLiked = await this.isUserLikedPost(PostId, userId);
//     const likeUsers = await this.postRepository
//       .createQueryBuilder('post')
//       .relation(Post, 'LikedBy')
//       .of(post)
//       .loadMany();
//     if (isLiked) {
//       // Remove like
//       await this.postsRepository
//         .createQueryBuilder()
//         .relation(Post, 'LikedBy')
//         .of(post)
//         .remove(user);
//       // Update cache
//       await this.cacheManager.del(`postLikedUsers:${PostId}`);
//     } else {
//       // Add like
//       await this.postsRepository
//         .createQueryBuilder()
//         .relation(Post, 'LikedBy')
//         .of(post)
//         .add(user);
//       // Update cache
//       await this.cacheManager.del(`postLikedUsers:${PostId}`);
//     }
//     post.LikedBy = await this.getPostLikedUsers(PostId);
//     return post;
//   }
//   async isUserLikedPost(PostId: string, userId: string): Promise<boolean> {
//     const userCount = await this.postsRepository
//       .createQueryBuilder('post')
//       .innerJoin('post.LikedBy', 'user', 'user.id = :userId', { userId })
//       .where('post.id = :PostId', { PostId })
//       .getCount();
//     return userCount > 0;
//   }
//   async getPostLikedUsers(PostId: string) {
//     const cacheKey = `postLikedUsers:${PostId}`;
//     let likedUsers = await this.cacheManager.get(cacheKey);
//     if (!likedUsers) {
//       likedUsers = await this.postsRepository
//         .createQueryBuilder('post')
//         .relation(Post, 'LikedBy')
//         .of(PostId)
//         .loadMany();
//       await this.cacheManager.set(cacheKey, likedUsers, { ttl: 600 });
//     }
//     return likedUsers;
//   }
// }
