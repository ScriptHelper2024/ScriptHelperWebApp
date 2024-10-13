import gql from "graphql-tag";

export const LIST_BEAT_SHEET_VERSIONS = gql`
  query ListBeatSheetVersions($projectId: ID!, $sceneKey: ID!) {
    listBeatSheetVersions(projectId: $projectId, sceneKey: $sceneKey) {
      id
      sceneKey
      versionType
      sourceVersionNumber
      versionNumber
      versionLabel
      sceneTextId
      textNotes
      textContent
      characterCount
      llmModel
      createdAt
      createdBy
    }
  }
`;
