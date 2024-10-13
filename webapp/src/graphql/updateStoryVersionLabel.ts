import gql from "graphql-tag";

export const UPDATE_STORY_VERSION_LABEL = gql`
  mutation UpdateStoryVersionLabel(
    $projectId: ID!
    $storyTextId: ID!
    $versionLabel: String!
    $versionNumber: Int!
  ) {
    updateStoryVersionLabel(
      projectId: $projectId
      storyTextId: $storyTextId
      versionLabel: $versionLabel
      versionNumber: $versionNumber
    ) {
      success
    }
  }
`;
