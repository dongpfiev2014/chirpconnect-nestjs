import { gql } from '@apollo/client/core';

export const CREATE_CHAT_MUTATION = gql`
  mutation CreateChat($createChatInput: [CreateChatInput!]!) {
    createChat(createChatInput: $createChatInput) {
      ChatId
      ChatName
      IsGroupChat
      Users {
        UserId
      }
      CreatedAt
      UpdatedAt
    }
  }
`;

export const FIND_ALL_CHATS_QUERY = gql`
  query FindAllChats($UserId: ID!) {
    findAllChats(UserId: $UserId) {
      ChatId
      ChatName
      IsGroupChat
      CreatedAt
      UpdatedAt
      LatestMessage {
        MessageId
        Content
        CreatedAt
        UpdatedAt
        Sender {
          UserId
          FirstName
          LastName
        }
        ReadBy {
          UserId
          FirstName
          LastName
        }
      }
      Users {
        UserId
        FirstName
        LastName
        ProfilePic
      }
    }
  }
`;

export const FIND_ONE_CHAT_QUERY = gql`
  query FindOneChat($UserId: ID!, $ChatId: ID!) {
    findOneChat(UserId: $UserId, ChatId: $ChatId) {
      ChatId
      ChatName
      IsGroupChat
      CreatedAt
      UpdatedAt
      LatestMessage {
        MessageId
        Content
      }
      Users {
        UserId
        FirstName
        LastName
        Username
        Email
        ProfilePic
        CoverPhoto
        CreatedAt
        UpdatedAt
      }
    }
  }
`;

export const UPDATE_CHAT_MUTATION = gql`
  mutation UpdateChat($updateChatInput: UpdateChatInput!) {
    updateChat(updateChatInput: $updateChatInput) {
      ChatId
      ChatName
      IsGroupChat
      CreatedAt
      UpdatedAt
    }
  }
`;
