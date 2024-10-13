import gql from "graphql-tag";

export const GET_DEFAULT_LLM_OPTIONS = gql`
  query GetDefaultLlmOptions {
    defaultLlmOptions {
      defaultLlmOptions
    }
  }
`;
