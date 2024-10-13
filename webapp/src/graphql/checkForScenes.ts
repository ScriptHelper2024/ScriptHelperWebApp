import gql from "graphql-tag";

export const CHECK_FOR_SCENES = gql`
  query CheckForScenes($projectId: ID!) {
    listProjectScenes(projectId: $projectId) {
      id
    }
  }
`;
