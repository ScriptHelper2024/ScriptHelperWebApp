import gql from "graphql-tag";

export const CREATE_STORY_FROM_UPDATE = gql`
  mutation GenerateStoryFromUpdate(
    $projectId: ID!
    $textId: ID!
    $textContent: String
    $textSeed: String
  ) {
    updateStoryText(
      projectId: $projectId
      textId: $textId
      textContent: $textContent
      textSeed: $textSeed
    ) {
      storyText {
        id
        versionNumber
        versionLabel
      }
    }
  }
`;
