import gql from "graphql-tag";

export const GET_STYLES = gql`
  query AllStyles {
    allStyleGuidelines {
      styleGuidelines {
        id
        name
      }
    }
  }
`;
