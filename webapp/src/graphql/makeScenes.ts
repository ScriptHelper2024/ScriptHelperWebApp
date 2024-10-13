import gql from "graphql-tag";

export const MAKE_SCENES = gql`
  mutation GenerateMakeScenes(
    $storyTextId: ID!
    $projectId: ID!
    $sceneCount: Int!
  ) {
    generateMakeScenes(
      storyTextId: $storyTextId
      projectId: $projectId
      sceneCount: $sceneCount
    ) {
      agentTaskId
    }
  }
`;
