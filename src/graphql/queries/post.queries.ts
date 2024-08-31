import { gql } from '@apollo/client/core';

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($createPostInput: CreatePostInput!, $user: UserInput!) {
    createPost(createPostInput: $createPostInput, user: $user) {
      PostId
      Content
      Pinned
      CreatedAt
      UpdatedAt
      PostedBy {
        UserId
        FirstName
        LastName
        Username
        Email
        ProfilePic
        CreatedAt
        UpdatedAt
      }
      LikedBy {
        UserId
      }
      OriginalPost {
        PostId
      }
      RetweetUsers {
        UserId
      }
      RetweetedPosts {
        PostId
      }
    }
  }
`;

export const FIND_ALL_POSTS_QUERY = gql`
  query FindAllPosts($user: UserInput!) {
    findAllPosts(user: $user) {
      PostId
      Content
      Pinned
      CreatedAt
      UpdatedAt
      PostedBy {
        UserId
        FirstName
        LastName
        Username
        Email
        ProfilePic
        CreatedAt
        UpdatedAt
      }
      LikedBy {
        UserId
        FirstName
        LastName
        Username
        Email
        ProfilePic
        CreatedAt
        UpdatedAt
      }
      OriginalPost {
        PostId
        Content
        Pinned
        CreatedAt
        UpdatedAt
        PostedBy {
          UserId
          FirstName
          LastName
          Username
          Email
          ProfilePic
        }
        RetweetUsers {
          UserId
        }
        LikedBy {
          UserId
        }
      }
      RetweetUsers {
        UserId
        FirstName
        LastName
        Username
        Email
        ProfilePic
      }
      RetweetedPosts {
        PostId
        Content
        Pinned
        CreatedAt
        UpdatedAt
      }
    }
  }
`;

export const FIND_ONE_POST_QUERY = gql`
  query FindOnePost($PostId: ID!, $user: UserInput!) {
    findOnePost(PostId: $PostId, user: $user) {
      PostId
      Content
      Pinned
      CreatedAt
      UpdatedAt
      PostedBy {
        UserId
        FirstName
        LastName
        Username
        Email
        ProfilePic
        CreatedAt
        UpdatedAt
      }
      LikedBy {
        UserId
        FirstName
        LastName
        Username
      }
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation RemovePost($PostId: ID!, $user: UserInput!) {
    removePost(PostId: $PostId, user: $user) {
      success
      message
    }
  }
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost(
    $PostId: ID!
    $updatePostInput: UpdatePostInput!
    $user: UserInput!
  ) {
    updatePost(
      PostId: $PostId
      updatePostInput: $updatePostInput
      user: $user
    ) {
      PostId
      Content
      Pinned
      CreatedAt
      UpdatedAt
    }
  }
`;

export const UPDATE_POST_LIKES_MUTATION = gql`
  mutation UpdatePostLikes($PostId: ID!, $user: UserInput!) {
    updatePostLikes(PostId: $PostId, user: $user) {
      PostId
      LikedBy {
        UserId
        Username
      }
    }
  }
`;

export const UPDATE_RETWEET_MUTATION = gql`
  mutation UpdateRetweet($PostId: ID!, $user: UserInput!) {
    updateRetweet(PostId: $PostId, user: $user) {
      PostId
      Content
      Pinned
      CreatedAt
      UpdatedAt
      RetweetUsers {
        UserId
      }
    }
  }
`;
