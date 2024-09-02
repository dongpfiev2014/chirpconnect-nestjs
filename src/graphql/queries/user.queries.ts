// queries/user.queries.ts
import { gql } from '@apollo/client/core';

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(createUserInput: $input) {
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
`;

export const FIND_ALL_USERS_QUERY = gql`
  query FindAllUsers {
    findAllUsers {
      UserId
      FirstName
      LastName
      Username
      Email
      ProfilePic
      CreatedAt
      UpdatedAt
      Following {
        UserId
      }
      Followers {
        UserId
      }
    }
  }
`;

export const FIND_USER_QUERY = gql`
  query FindProfile($Username: String!) {
    findProfile(Username: $Username) {
      UserId
      FirstName
      LastName
      Username
      ProfilePic
      Following {
        UserId
      }
      Followers {
        UserId
      }
    }
  }
`;

export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($ProfileId: ID!, $UserId: ID!) {
    followUser(ProfileId: $ProfileId, UserId: $UserId) {
      UserId
      Following {
        UserId
      }
    }
  }
`;

export const GET_FOLLOWING_USER_QUERY = gql`
  query RenderFollowingUser($UserId: ID!) {
    renderFollowingUser(UserId: $UserId) {
      UserId
      Following {
        UserId
        FirstName
        LastName
        Username
        ProfilePic
      }
    }
  }
`;

export const GET_FOLLOWERS_QUERY = gql`
  query RenderFollowers($UserId: ID!) {
    renderFollowers(UserId: $UserId) {
      UserId
      Followers {
        UserId
        FirstName
        LastName
        Username
        ProfilePic
      }
    }
  }
`;
