import gql from "graphql-tag";

export const GET_LOCATION_OBJECT = gql`
  query GetLocationObject($textId: ID, $projectId: ID!, $locationKey: String) {
    getLocationProfile(
      textId: $textId
      projectId: $projectId
      locationKey: $locationKey
    ) {
      id
      name
      versionLabel
      textSeed
      textNotes
      textContent
    }
  }
`;
