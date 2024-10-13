import gql from "graphql-tag";

export const DELETE_SCENE_BY_KEY_MUTATION = gql`
  mutation DeleteSceneByKey($projectId: ID!, $sceneKey: String!) {
    deleteSceneByKey(projectId: $projectId, sceneKey: $sceneKey) {
      success
    }
  }
`;
