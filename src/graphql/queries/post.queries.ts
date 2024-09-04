import { gql } from '@apollo/client/core';

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($createPostInput: CreatePostInput!, $UserId: ID!) {
    createPost(createPostInput: $createPostInput, UserId: $UserId) {
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
        ProfilePic
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
      ReplyTo {
        PostId
      }
    }
  }
`;

export const FIND_ALL_POSTS_QUERY = gql`
  query FindAllPosts($UserId: ID, $isReply: Boolean, $followingOnly: Boolean) {
    findAllPosts(
      UserId: $UserId
      isReply: $isReply
      followingOnly: $followingOnly
    ) {
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
        ProfilePic
      }
      LikedBy {
        UserId
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
        ProfilePic
      }
      ReplyTo {
        PostId
        PostedBy {
          UserId
          Username
        }
      }
    }
  }
`;

export const FIND_ONE_POST_QUERY = gql`
  query FindOnePost($PostId: ID!) {
    findOnePost(PostId: $PostId) {
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
        ProfilePic
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
      ReplyTo {
        PostId
        Content
        CreatedAt
        UpdatedAt
        PostedBy {
          UserId
          FirstName
          LastName
          Username
          ProfilePic
        }
        RetweetUsers {
          UserId
        }
        LikedBy {
          UserId
        }
        OriginalPost {
          PostId
        }
      }
      Replies {
        PostId
        Content
        CreatedAt
        UpdatedAt
        PostedBy {
          UserId
          FirstName
          LastName
          Username
          ProfilePic
        }
        OriginalPost {
          PostId
        }
        ReplyTo {
          PostId
          PostedBy {
            UserId
            Username
          }
        }
        RetweetUsers {
          UserId
        }
        LikedBy {
          UserId
        }
      }
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation RemovePost($PostId: ID!, $UserId: ID!) {
    removePost(PostId: $PostId, UserId: $UserId) {
      success
      message
    }
  }
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost(
    $PostId: ID!
    $updatePostInput: UpdatePostInput!
    $UserId: ID!
  ) {
    updatePost(
      PostId: $PostId
      updatePostInput: $updatePostInput
      UserId: $UserId
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
  mutation UpdatePostLikes($PostId: ID!, $UserId: ID!) {
    updatePostLikes(PostId: $PostId, UserId: $UserId) {
      PostId
      LikedBy {
        UserId
        Username
      }
    }
  }
`;

export const UPDATE_RETWEET_MUTATION = gql`
  mutation UpdateRetweet($PostId: ID!, $UserId: ID!) {
    updateRetweet(PostId: $PostId, UserId: $UserId) {
      PostId
      RetweetUsers {
        UserId
      }
    }
  }
`;

export const UPDATE_POST_PINNED_MUTATION = gql`
  mutation UpdatePinned($PostId: ID!, $UserId: ID!, $Pinned: Boolean!) {
    updatePinned(PostId: $PostId, UserId: $UserId, Pinned: $Pinned) {
      PostId
      Pinned
    }
  }
`;
