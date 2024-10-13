import gql from "graphql-tag";

export const RESEND_VERIFY_EMAIL_MUTATION = gql`
  mutation ResendVerifyEmail {
    sendEmailVerification {
      success
    }
  }
`;
