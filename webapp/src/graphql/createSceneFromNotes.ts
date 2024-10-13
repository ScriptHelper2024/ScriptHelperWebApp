import gql from "graphql-tag";

export const CREATE_SCENE_WITH_NOTES = gql`
  mutation GenerateSceneWithNotes(
    $projectId: ID!
    $textId: ID!
    $textNotes: String!
    $selectTextEnd: Int
    $selectTextStart: Int
  ) {
    generateSceneWithNotes(
      projectId: $projectId
      textId: $textId
      textNotes: $textNotes
      selectTextEnd: $selectTextEnd
      selectTextStart: $selectTextStart
    ) {
      agentTaskId
    }
  }
`;
