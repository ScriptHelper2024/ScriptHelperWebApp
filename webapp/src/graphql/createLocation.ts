import gql from "graphql-tag";

export const CREATE_CHARACTER = gql`
  mutation CreateLocationProfile(
    $projectId: ID!
    $name: String!
    $textSeed: String
  ) {
    createLocationProfile(
      projectId: $projectId
      name: $name
      textSeed: $textSeed
    ) {
      locationProfile {
        id
        projectId
        locationKey
        locationOrder
        name
        versionType
        sourceVersionNumber
        versionNumber
        versionLabel
        textSeed
        textNotes
        textContent
        locationCount
        llmModel
        createdAt
        createdBy
      }
    }
  }
`;
