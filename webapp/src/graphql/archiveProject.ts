import gql from "graphql-tag";

export const ARCHIVE_PROJECT = gql`
  mutation ArchiveProject($projectId: ID!) {
    archiveProject(projectId: $projectId) {
      success
    }
  }
`;
