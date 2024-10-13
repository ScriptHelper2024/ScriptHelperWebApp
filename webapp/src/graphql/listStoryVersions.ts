import gql from "graphql-tag";

export const LIST_STORY_VERSIONS = gql`
  query ListStoryVersions($projectId: ID!) {
    listStoryVersions(projectId: $projectId) {
      id
      versionType
      versionNumber
    }
  }
`;
