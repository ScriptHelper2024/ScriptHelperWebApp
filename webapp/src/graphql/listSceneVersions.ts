import gql from "graphql-tag";

export const LIST_SCENE_VERSIONS = gql`
  query ListSceneVersions($projectId: ID!, $sceneKey: String!) {
    listSceneVersions(projectId: $projectId, sceneKey: $sceneKey) {
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
