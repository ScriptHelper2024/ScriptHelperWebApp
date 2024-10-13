import gql from "graphql-tag";

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($code: String!) {
    verifyEmail(code: $code) {
      success
    }
  }
`;
