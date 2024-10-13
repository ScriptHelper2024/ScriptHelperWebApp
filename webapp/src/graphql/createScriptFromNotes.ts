import gql from "graphql-tag";

export const CREATE_SCRIPT_WITH_NOTES = gql`
  mutation GenerateScriptTextWithNotes(
    $projectId: ID!
    $textId: ID!
    $textNotes: String!
    $selectTextEnd: Int
    $selectTextStart: Int
    $includeBeatSheet: Boolean
    $sceneKey: ID!
  ) {
    generateScriptTextWithNotes(
      projectId: $projectId
      textId: $textId
      textNotes: $textNotes
      selectTextEnd: $selectTextEnd
      selectTextStart: $selectTextStart
      includeBeatSheet: $includeBeatSheet
      sceneKey: $sceneKey
    ) {
      agentTaskId
    }
  }
`;
