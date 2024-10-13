import gql from "graphql-tag";

export const CREATE_STORY_FROM_SEED = gql`
  mutation GenerateStoryFromSeed(
    $projectId: ID!
    $textId: ID!
    $textSeed: String!
  ) {
    generateStoryFromSeed(
      projectId: $projectId
      textId: $textId
      textSeed: $textSeed
    ) {
      agentTaskId
    }
  }
`;
