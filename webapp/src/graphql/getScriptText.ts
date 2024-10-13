import gql from "graphql-tag";

export const GET_SCRIPT_TEXT = gql`
  query GetScriptText(
    $projectId: ID!
    $sceneKey: UUID!
    $versionNumber: Int
    $textId: ID!
  ) {
    getScriptText(
      projectId: $projectId
      sceneKey: $sceneKey
      versionNumber: $versionNumber
      textId: $textId
    ) {
      id
      sceneKey
      versionType
      sourceVersionNumber
      versionNumber
      versionLabel
      sceneTextId
      textNotes
      textContent
      textContentFormatted
      characterCount
      llmModel
      createdAt
      createdBy
    }
  }
`;
