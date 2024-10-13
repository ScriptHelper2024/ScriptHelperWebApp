import gql from "graphql-tag";

export const CREATE_SCENE_FROM_SEED = gql`
  mutation GenerateSceneFromSeed(
    $projectId: ID!
    $textId: ID!
    $textSeed: String!
  ) {
    generateSceneFromSeed(
      projectId: $projectId
      textId: $textId
      textSeed: $textSeed
    ) {
      agentTaskId
    }
  }
`;
