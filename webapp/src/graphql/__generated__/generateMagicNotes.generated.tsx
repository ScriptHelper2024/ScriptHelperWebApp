import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateMagicNotesMutationVariables = Types.Exact<{
  criticIds: Array<Types.InputMaybe<Types.Scalars['ID']>> | Types.InputMaybe<Types.Scalars['ID']>;
  documentId: Types.Scalars['ID'];
  documentType: Types.Scalars['String'];
  projectId: Types.Scalars['ID'];
}>;


export type GenerateMagicNotesMutation = { __typename: 'Mutations', generateMagicNotes?: { __typename: 'GenerateMagicNotes', agentTaskId?: string | null } | null };


export const GenerateMagicNotesDocument = gql`
    mutation GenerateMagicNotes($criticIds: [ID]!, $documentId: ID!, $documentType: String!, $projectId: ID!) {
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
export type GenerateMagicNotesMutationFn = Apollo.MutationFunction<GenerateMagicNotesMutation, GenerateMagicNotesMutationVariables>;

/**
 * __useGenerateMagicNotesMutation__
 *
 * To run a mutation, you first call `useGenerateMagicNotesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateMagicNotesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateMagicNotesMutation, { data, loading, error }] = useGenerateMagicNotesMutation({
 *   variables: {
 *      criticIds: // value for 'criticIds'
 *      documentId: // value for 'documentId'
 *      documentType: // value for 'documentType'
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useGenerateMagicNotesMutation(baseOptions?: Apollo.MutationHookOptions<GenerateMagicNotesMutation, GenerateMagicNotesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateMagicNotesMutation, GenerateMagicNotesMutationVariables>(GenerateMagicNotesDocument, options);
      }
export type GenerateMagicNotesMutationHookResult = ReturnType<typeof useGenerateMagicNotesMutation>;
export type GenerateMagicNotesMutationResult = Apollo.MutationResult<GenerateMagicNotesMutation>;
export type GenerateMagicNotesMutationOptions = Apollo.BaseMutationOptions<GenerateMagicNotesMutation, GenerateMagicNotesMutationVariables>;