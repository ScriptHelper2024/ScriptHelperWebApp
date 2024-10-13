import gql from "graphql-tag";

export const UPDATE_LOCATION = gql`
  mutation UpdateLocationProfile(
    $projectId: ID!
    $name: String!
    $textId: ID!
    $textSeed: String
    $textContent: String
    $textNotes: String
  ) {
    updateLocationProfile(
      projectId: $projectId
      name: $name
      textId: $textId
      textSeed: $textSeed
      textContent: $textContent
      textNotes: $textNotes
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
