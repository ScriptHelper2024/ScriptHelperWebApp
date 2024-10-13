import gql from "graphql-tag";

export const GET_CHARACTER_OBJECT = gql`
  query GetCharacterObject(
    $textId: ID
    $projectId: ID!
    $characterKey: String
  ) {
    getCharacterProfile(
      textId: $textId
      projectId: $projectId
      characterKey: $characterKey
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
