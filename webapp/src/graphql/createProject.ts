import gql from "graphql-tag";

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($textSeed: String, $title: String!) {
    createProject(textSeed: $textSeed, title: $title) {
      project {
        id
        title
        latestStoryTextId
        createdAt
        updatedAt
        archived
        metadata
        members
      }
    }
  }
`;
