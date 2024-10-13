import gql from "graphql-tag";

export const GET_SCENE_TEXT = gql`
  query GetSceneText($projectId: ID!, $versionNumber: Int, $textId: ID!) {
    getSceneText(
      projectId: $projectId
      versionNumber: $versionNumber
      textId: $textId
    ) {
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
