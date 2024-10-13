import gql from "graphql-tag";

export const LIST_SCRIPT_VERSIONS = gql`
  query ListScriptTextVersions($projectId: ID!, $sceneKey: ID!) {
    listScriptTextVersions(projectId: $projectId, sceneKey: $sceneKey) {
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
