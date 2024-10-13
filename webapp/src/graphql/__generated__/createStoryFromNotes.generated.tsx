import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GenerateStoryWithNotesMutationVariables = Types.Exact<{
  projectId: Types.Scalars['ID'];
  textId: Types.Scalars['ID'];
  textNotes: Types.Scalars['String'];
  selectTextEnd?: Types.InputMaybe<Types.Scalars['Int']>;
  selectTextStart?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type GenerateStoryWithNotesMutation = { __typename: 'Mutations', generateStoryWithNotes?: { __typename: 'GenerateStoryWithNotes', agentTaskId?: string | null } | null };


export const GenerateStoryWithNotesDocument = gql`
    mutation GenerateStoryWithNotes($projectId: ID!, $textId: ID!, $textNotes: String!, $selectTextEnd: Int, $selectTextStart: Int) {
  generateStoryWithNotes(
    projectId: $projectId
    textId: $textId
    textNotes: $textNotes
    selectTextEnd: $selectTextEnd
    selectTextStart: $selectTextStart
  ) {
    agentTaskId
  }
}
    `;
export type GenerateStoryWithNotesMutationFn = Apollo.MutationFunction<GenerateStoryWithNotesMutation, GenerateStoryWithNotesMutationVariables>;

/**
 * __useGenerateStoryWithNotesMutation__
 *
 * To run a mutation, you first call `useGenerateStoryWithNotesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateStoryWithNotesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateStoryWithNotesMutation, { data, loading, error }] = useGenerateStoryWithNotesMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      textId: // value for 'textId'
 *      textNotes: // value for 'textNotes'
 *      selectTextEnd: // value for 'selectTextEnd'
 *      selectTextStart: // value for 'selectTextStart'
 *   },
 * });
 */
export function useGenerateStoryWithNotesMutation(baseOptions?: Apollo.MutationHookOptions<GenerateStoryWithNotesMutation, GenerateStoryWithNotesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateStoryWithNotesMutation, GenerateStoryWithNotesMutationVariables>(GenerateStoryWithNotesDocument, options);
      }
export type GenerateStoryWithNotesMutationHookResult = ReturnType<typeof useGenerateStoryWithNotesMutation>;
export type GenerateStoryWithNotesMutationResult = Apollo.MutationResult<GenerateStoryWithNotesMutation>;
export type GenerateStoryWithNotesMutationOptions = Apollo.BaseMutationOptions<GenerateStoryWithNotesMutation, GenerateStoryWithNotesMutationVariables>;