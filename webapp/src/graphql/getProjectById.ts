import gql from "graphql-tag";

export const PROJECT_QUERY_BY_ID = gql`
  query ProjectById($id: ID!) {
    projectById(id: $id) {
      id
      title
      latestStoryTextId
      createdAt
      updatedAt
    }
  }
`;
