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

export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($ProfileId: ID!, $UserId: ID!) {
    followUser(ProfileId: $ProfileId, UserId: $UserId) {
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
