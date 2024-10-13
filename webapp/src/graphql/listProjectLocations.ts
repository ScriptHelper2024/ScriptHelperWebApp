import gql from "graphql-tag";

export const LIST_LOCATIONS = gql`
  query ListProjectLocations($projectId: ID!) {
    listProjectLocations(projectId: $projectId) {
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
`;
