import { gql } from '@apollo/client/core';

export const CREATE_MESSAGE_MUTATION = gql`
  mutation CreateMessage($createMessageInput: CreateMessageInput!) {
    createMessage(createMessageInput: $createMessageInput) {
      MessageId
      Content
      CreatedAt
      UpdatedAt
      Sender {
        UserId
        FirstName
        LastName
        Username
        Email
        ProfilePic
        CoverPhoto
      }
      Chat {
        ChatId
        ChatName
        IsGroupChat
        CreatedAt
        UpdatedAt
      }
    }
  }
`;

export const FIND_ALL_MESSAGES_QUERY = gql`
  query FindAllMessages($ChatId: ID!) {
    findAllMessages(ChatId: $ChatId) {
      MessageId
      Content
      CreatedAt
      UpdatedAt
      Sender {
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
