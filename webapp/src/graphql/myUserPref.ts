import gql from "graphql-tag";

export const GET_DEFAULT_PREF = gql`
  query MyUserPreference {
    myUserPreference {
      defaultLlm
    }
  }
`;
