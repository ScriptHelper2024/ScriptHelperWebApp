import gql from "graphql-tag";

export const REGISTER_USER_MUTATION = gql`
  mutation RegisterUser(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    registerUser(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    ) {
      user {
        email
      }
      accessToken
    }
  }
`;
