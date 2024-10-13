import gql from "graphql-tag";

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateSceneText(
    $projectId: ID!
    $textSeed: String!
    $title: String!
  ) {
    createSceneText(projectId: $projectId, title: $title, textSeed: $textSeed) {
      sceneText {
        sceneKey
      }
    }
  }
`;
