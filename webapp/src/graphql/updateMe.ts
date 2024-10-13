import gql from "graphql-tag";

export const UPDATE_ME_MUTATION = gql`
  mutation UpdateMe(
    $email: String
    $firstName: String
    $lastName: String
    $password: String
  ) {
    updateMe(
      email: $email
      firstName: $firstName
      lastName: $lastName
      password: $password
    ) {
      user {
        id
      }
    }
  }
`;
