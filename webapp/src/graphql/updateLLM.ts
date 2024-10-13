import gql from "graphql-tag";

export const UPDATE_USER_PREF = gql`
  mutation UpdateMyUserPreference($defaultLlm: String!) {
    updateMyUserPreference(defaultLlm: $defaultLlm) {
      userPreference {
        defaultLlm
      }
    }
  }
`;
