import gql from "graphql-tag";

export const LIST_MAGIC_NOTE_CRITICS = gql`
  query ListMagicNoteCriticsByType($documentType: String!) {
    listMagicNoteCriticsByType(documentType: $documentType) {
      id
      name
    }
  }
`;
