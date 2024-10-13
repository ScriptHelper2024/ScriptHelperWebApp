import gql from "graphql-tag";

export const CREATE_CHARACTER = gql`
  mutation CreateCharacterProfile(
    $projectId: ID!
    $name: String!
    $textSeed: String
  ) {
    createCharacterProfile(
      projectId: $projectId
      name: $name
      textSeed: $textSeed
    ) {
      characterProfile {
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
  }
`;
