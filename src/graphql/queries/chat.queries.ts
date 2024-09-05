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
