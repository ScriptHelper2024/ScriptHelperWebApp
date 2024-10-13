import gql from "graphql-tag";

export const UPDATE_CHARACTER = gql`
  mutation UpdateCharacterProfile(
    $projectId: ID!
    $name: String!
    $textId: ID!
    $textSeed: String
    $textContent: String
    $textNotes: String
  ) {
    updateCharacterProfile(
      projectId: $projectId
      name: $name
      textId: $textId
      textSeed: $textSeed
      textContent: $textContent
      textNotes: $textNotes
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
