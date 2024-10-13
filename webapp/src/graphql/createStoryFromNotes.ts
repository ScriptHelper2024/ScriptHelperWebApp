import gql from "graphql-tag";

export const CREATE_STORY_WITH_NOTES = gql`
  mutation GenerateStoryWithNotes(
    $projectId: ID!
    $textId: ID!
    $textNotes: String!
    $selectTextEnd: Int
    $selectTextStart: Int
  ) {
    generateStoryWithNotes(
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
