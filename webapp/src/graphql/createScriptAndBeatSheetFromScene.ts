import gql from "graphql-tag";

export const CREATE_SCRIPT_AND_BEAT_FROM_SCENE = gql`
  mutation GenerateScriptAndBeatSheet(
    $projectId: ID!
    $sceneKey: ID!
    $sceneTextId: ID!
    $styleGuidelineId: ID
    $scriptDialogFlavorId: ID
  ) {
    generateScriptAndBeatSheet(
      projectId: $projectId
      sceneKey: $sceneKey
      sceneTextId: $sceneTextId
      scriptDialogFlavorId: $scriptDialogFlavorId
      styleGuidelineId: $styleGuidelineId
    ) {
      agentTaskId
    }
  }
`;
