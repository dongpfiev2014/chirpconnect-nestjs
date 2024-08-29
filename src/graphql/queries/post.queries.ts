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
    }
  }
`;
