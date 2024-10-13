import gql from "graphql-tag";

export const GET_STORY_TEXT = gql`
  query GetStoryText($textId: ID, $projectId: ID!, $versionNumber: Int) {
    getStoryText(
      textId: $textId
      projectId: $projectId
      versionNumber: $versionNumber
    ) {
      id
      projectId
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
    }
  }
`;
