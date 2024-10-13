import gql from "graphql-tag";

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($projectId: ID!, $title: String) {
    updateProject(projectId: $projectId, title: $title) {
      project {
        id
      }
    }
  }
`;
