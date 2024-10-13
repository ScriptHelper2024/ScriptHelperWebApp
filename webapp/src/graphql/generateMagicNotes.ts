import gql from "graphql-tag";

export const GENERATE_MAGIC_NOTES_MUTATION = gql`
  mutation GenerateMagicNotes(
    $criticIds: [ID]!
    $documentId: ID!
    $documentType: String!
    $projectId: ID!
  ) {
    generateMagicNotes(
      criticIds: $criticIds
      documentId: $documentId
      documentType: $documentType
      projectId: $projectId
    ) {
      agentTaskId
    }
  }
`;
