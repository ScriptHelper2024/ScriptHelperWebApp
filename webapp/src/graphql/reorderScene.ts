import gql from "graphql-tag";

export const REORDER_SCENE_MUTATION = gql`
  mutation ReorderScene($newSceneOrder: Int!, $projectId: ID!, $textId: ID!) {
    reorderScene(
      newSceneOrder: $newSceneOrder
      projectId: $projectId
      textId: $textId
    ) {
      success
    }
  }
`;
