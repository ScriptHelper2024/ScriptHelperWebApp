import gql from "graphql-tag";

export const LIST_PROJECT_SCENES = gql`
  query ListProjectScenes($projectId: ID!) {
    listProjectScenes(projectId: $projectId) {
      id
      sceneKey
      sceneOrder
      title
      versionType
      sourceVersionNumber
      versionNumber
      versionLabel
      textSeed
      textNotes
      textContent
      characterCount
      llmModel
      createdAt
      createdBy
      latestBeatSheetId
      latestScriptTextId
    }
  }
`;
