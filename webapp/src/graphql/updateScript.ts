import gql from "graphql-tag";

export const UPDATE_SCRIPT_TEXT_MUTATION = gql`
  mutation UpdateScriptText(
    $projectId: ID!
    $sceneTextId: ID!
    $textId: ID!
    $textContent: String
    $textNotes: String
  ) {
    updateScriptText(
      projectId: $projectId
      sceneTextId: $sceneTextId
      textContent: $textContent
      textId: $textId
      textNotes: $textNotes
    ) {
      scriptText {
        id
        versionNumber
        textContent
      }
    }
  }
`;
