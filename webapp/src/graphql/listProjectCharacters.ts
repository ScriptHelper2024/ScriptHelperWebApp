import gql from "graphql-tag";

export const LIST_CHARACTERS = gql`
  query ListProjectCharacters($projectId: ID!) {
    listProjectCharacters(projectId: $projectId) {
      id
      projectId
      characterKey
      characterOrder
      name
      versionType
      sourceVersionNumber
      versionNumber
      versionLabel
      textSeed
      textNotes
      textContent
      characterCount
      llmModel
      createdAt
      createdBy
    }
  }
`;
