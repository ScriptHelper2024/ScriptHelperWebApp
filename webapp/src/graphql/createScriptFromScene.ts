import gql from "graphql-tag";

export const CREATE_SCRIPT_FROM_SCENE = gql`
  mutation GenerateScriptTextFromScene(
    $projectId: ID!
    $sceneKey: ID!
    $sceneTextId: ID!
    $includeBeatSheet: Boolean!
    $scriptDialogFlavorId: ID
    $styleGuidelineId: ID
    $textId: ID!
  ) {
    generateScriptTextFromScene(
      projectId: $projectId
      sceneKey: $sceneKey
      sceneTextId: $sceneTextId
      includeBeatSheet: $includeBeatSheet
      scriptDialogFlavorId: $scriptDialogFlavorId
      styleGuidelineId: $styleGuidelineId
      textId: $textId
    ) {
      agentTaskId
    }
  }
`;
