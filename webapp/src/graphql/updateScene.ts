import gql from "graphql-tag";

export const UPDATE_SCENE_TEXT_MUTATION = gql`
  mutation UpdateSceneText(
    $projectId: ID!
    $textContent: String
    $textId: ID!
    $textNotes: String
    $textSeed: String
    $title: String
  ) {
    updateSceneText(
      projectId: $projectId
      textContent: $textContent
      textId: $textId
      textNotes: $textNotes
      textSeed: $textSeed
      title: $title
    ) {
      sceneText {
        id
        versionNumber
        title
        textContent
        textNotes
        textSeed
      }
    }
  }
`;
