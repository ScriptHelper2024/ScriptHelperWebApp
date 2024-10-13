import gql from "graphql-tag";

export const GET_PROJECT_TITLE = gql`
  query GetProjectTitle($id: ID!) {
    projectById(id: $id) {
      title
    }
  }
`;
